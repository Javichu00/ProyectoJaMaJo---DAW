package com.jamajo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jamajo.backend.entity.Plan;
import com.jamajo.backend.service.PlanService;
import java.util.List;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<List<Plan>> getAll() {
        return ResponseEntity.ok(planService.findAll());
    }

    @GetMapping("/{nombrePlan}")
    public ResponseEntity<Plan> getById(@PathVariable String nombrePlan) {
        return planService.findById(nombrePlan)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{nombrePlan}")
    public ResponseEntity<Plan> update(@PathVariable String nombrePlan, @RequestBody Plan plan) {
        return planService.findById(nombrePlan)
            .map(existing -> {
                existing.setPrecio(plan.getPrecio());
                return ResponseEntity.ok(planService.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
}