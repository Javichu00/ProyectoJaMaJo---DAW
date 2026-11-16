package com.jamajo.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jamajo.backend.DTO.PagoCreateDTO;
import com.jamajo.backend.DTO.PagoDTO;
import com.jamajo.backend.entity.Cuenta;
import com.jamajo.backend.entity.Pago;
import com.jamajo.backend.entity.Plan;
import com.jamajo.backend.entity.Usuario;
import com.jamajo.backend.repository.CuentaRepository;
import com.jamajo.backend.repository.PagoRepository;
import com.jamajo.backend.repository.PlanRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {
	private final CuentaRepository cuentaRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlanRepository planRepository;

    public PagoService(PagoRepository pagoRepository, UsuarioRepository usuarioRepository, PlanRepository planRepository, CuentaRepository cuentaRepository) {
        this.pagoRepository = pagoRepository;
        this.usuarioRepository = usuarioRepository;
        this.planRepository = planRepository;
        this.cuentaRepository = cuentaRepository;
        
    }
    
    private int getMaxCuentas(String nombrePlan) {
        return switch (nombrePlan) {
            case "GRATIS"   -> 1;
            case "ANUNCIOS" -> 2;
            case "ESTANDAR" -> 4;
            case "PRO"      -> 6;
            default         -> 1;
        };
    }

    public PagoDTO toDTO(Pago p) {
        return new PagoDTO(
            p.getIdPago(),
            p.getUsuario().getEmail(),
            p.getPlan().getNombrePlan(),
            p.getImporte(),
            p.getFechaPago()
        );
    }

    public List<PagoDTO> findByEmail(String email) {
        Usuario u = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));
        return pagoRepository.findByUsuarioOrderByFechaPagoDesc(u)
            .stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional
    public PagoDTO create(String email, PagoCreateDTO dto) {
        Usuario u = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        Plan plan = planRepository.findById(dto.getNombrePlan())
            .orElseThrow(() -> new RuntimeException("Plan no encontrado: " + dto.getNombrePlan()));
        
        if (plan.getNombrePlan().equals("GRATIS")) {
            u.setPlan(plan);
            u.setFechaFin(null);
            usuarioRepository.save(u);
            return null;
        };
       

        Pago pago = new Pago();
        pago.setUsuario(u);
        pago.setPlan(plan);
        pago.setImporte(plan.getPrecio());
        pago.setFechaPago(LocalDateTime.now());
        pagoRepository.save(pago);

        u.setPlan(plan);
        u.setFechaFin(LocalDate.now().plusDays(30));
        usuarioRepository.save(u);
        
        int maxCuentas = getMaxCuentas(plan.getNombrePlan());
        List<Cuenta> cuentas = cuentaRepository.findByEmailOrderByIdCuentaAsc(u.getEmail());
        if (cuentas.size() > maxCuentas) {
            List<Cuenta> sobran = cuentas.subList(maxCuentas, cuentas.size());
            cuentaRepository.deleteAll(sobran);
        }
        
        return toDTO(pago);
    }
    
    public List<PagoDTO> findAll() {
        return pagoRepository.findAll()
            .stream()
            .map(this::toDTO)
            .toList();
    }
    
}