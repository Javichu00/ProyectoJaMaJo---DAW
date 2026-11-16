package com.jamajo.backend.service;

import org.springframework.stereotype.Service;
import com.jamajo.backend.entity.Plan;
import com.jamajo.backend.repository.PlanRepository;
import java.util.List;
import java.util.Optional;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<Plan> findAll() {
        return planRepository.findAll();
    }

    public Optional<Plan> findById(String nombrePlan) {
        return planRepository.findById(nombrePlan);
    }
    
    public Plan save(Plan plan) {
        return planRepository.save(plan);
    }
    
}