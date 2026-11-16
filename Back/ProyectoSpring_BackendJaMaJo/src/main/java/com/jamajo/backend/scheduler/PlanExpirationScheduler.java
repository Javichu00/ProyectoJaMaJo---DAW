package com.jamajo.backend.scheduler;

import com.jamajo.backend.entity.Plan;
import com.jamajo.backend.repository.PlanRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class PlanExpirationScheduler {

    private final UsuarioRepository usuarioRepository;
    private final PlanRepository planRepository;

    public PlanExpirationScheduler(UsuarioRepository usuarioRepository, PlanRepository planRepository) {
        this.usuarioRepository = usuarioRepository;
        this.planRepository = planRepository;
    }

    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void expirarPlanes() {
        Plan planGratis = planRepository.findById("GRATIS").orElseThrow();

        usuarioRepository.findByFechaFinBefore(LocalDate.now())
            .forEach(usuario -> {
                usuario.setPlan(planGratis);
                usuario.setFechaFin(null);
                usuarioRepository.save(usuario);
            });
    }
}