package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateTemplateRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.TemplateResponse;
import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceTemplateRepository;
import com.thrddqno.motomate.repository.UserRepository;
import com.thrddqno.motomate.util.CursorCodec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final MaintenanceTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public List<TemplateResponse> getTemplates(UUID userId, MaintenanceCategory category) {
        List<MaintenanceTemplate> templates;
        
        if (category != null) {
            templates = new ArrayList<>(templateRepository.findByCategoryAndIsPublic(category, true));
        } else {
            templates = new ArrayList<>(templateRepository.findByIsPublic(true));
        }
        
        // Add user's custom templates
        templates.addAll(templateRepository.findByCreatedByUserId(userId));
        
        return templates.stream()
                .map(this::toResponse)
                .toList();
    }

    public CursorPageResponse<TemplateResponse> getTemplates(UUID userId, MaintenanceCategory category, String cursor, int size) {
        int pageSize = normalizePageSize(size);
        List<MaintenanceTemplate> templates = templateRepository.findVisibleTemplatesKeyset(
                userId,
                category,
                CursorCodec.decodeInstant(cursor),
                PageRequest.of(0, pageSize + 1));

        boolean hasMore = templates.size() > pageSize;
        List<MaintenanceTemplate> pageItems = hasMore ? templates.subList(0, pageSize) : templates;
        String nextCursor = hasMore ? CursorCodec.encode(pageItems.getLast().getCreatedAt()) : null;

        return CursorPageResponse.<TemplateResponse>builder()
                .content(pageItems.stream().map(this::toResponse).toList())
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .pageSize(pageSize)
                .build();
    }

    public List<TemplateResponse> getCustomTemplates(UUID userId) {
        return templateRepository.findByCreatedByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TemplateResponse createCustomTemplate(CreateTemplateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MaintenanceTemplate template = MaintenanceTemplate.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .icon(request.getIcon())
                .defaultIntervalMileage(request.getDefaultIntervalMileage())
                .defaultIntervalDays(request.getDefaultIntervalDays())
                .isSpecial(false)
                .isPublic(false)
                .isSystem(false)
                .createdByUserId(userId)
                .build();

        MaintenanceTemplate saved = templateRepository.save(template);
        return toResponse(saved);
    }

    private TemplateResponse toResponse(MaintenanceTemplate template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .category(template.getCategory())
                .description(template.getDescription())
                .icon(template.getIcon())
                .defaultIntervalMileage(template.getDefaultIntervalMileage())
                .defaultIntervalDays(template.getDefaultIntervalDays())
                .isSpecial(template.getIsSpecial())
                .isSystem(template.getIsSystem())
                .build();
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 50);
    }
}
