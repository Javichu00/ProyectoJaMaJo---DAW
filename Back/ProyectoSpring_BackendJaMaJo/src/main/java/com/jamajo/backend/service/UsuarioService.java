package com.jamajo.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jamajo.backend.DTO.UsuarioCreateDTO;
import com.jamajo.backend.DTO.UsuarioDTO;
import com.jamajo.backend.DTO.UsuarioUpdateDTO;
import com.jamajo.backend.email.EmailService;
import com.jamajo.backend.entity.Cuenta;
import com.jamajo.backend.entity.Plan;
import com.jamajo.backend.entity.Usuario;
import com.jamajo.backend.enums.TipoUsuario;
import com.jamajo.backend.repository.CuentaRepository;
import com.jamajo.backend.repository.PlanRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PlanRepository planRepository;
    private final CuentaRepository cuentaRepository;
    private final EmailService emailService;

    public UsuarioService(UsuarioRepository usuarioRepository, PlanRepository planRepository, CuentaRepository cuentaRepository, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.planRepository = planRepository;
        this.cuentaRepository = cuentaRepository;
        this.emailService = emailService;
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findById(email);
    }

    @Transactional
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deleteByEmail(String email) {
        usuarioRepository.deleteById(email);
    }

    public UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(
            u.getEmail(),
            u.getFechaRegistro(),
            u.getTipoUsuario(),
            u.getEnabled(),
            u.getPlan().getNombrePlan(),
            u.getFechaFin()
        );
    }

    public List<UsuarioDTO> findAllDTO() {
        return usuarioRepository.findAll()
            .stream()
            .map(this::toDTO)
            .toList();
    }

    public Optional<UsuarioDTO> findByEmailDTO(String email) {
        return usuarioRepository.findById(email).map(this::toDTO);
    }
    
    public Boolean checkPassword(String email, String supuestaPassword) {
    	return usuarioRepository.checkPassword(email,supuestaPassword);
    }

    @Transactional
    public UsuarioDTO create(UsuarioCreateDTO dto) {
        if (usuarioRepository.existsById(dto.getEmail()))
            throw new RuntimeException("Ya existe un usuario con ese email");

        Plan planGratis = planRepository.findById("GRATIS")
            .orElseThrow(() -> new RuntimeException("Plan GRATIS no encontrado"));

        Usuario u = new Usuario();
        u.setEmail(dto.getEmail());
        u.setPassword(dto.getPassword());
        u.setFechaRegistro(LocalDate.now());
        u.setTipoUsuario(TipoUsuario.CLIENTE);
        u.setEnabled(true);
        u.setPlan(planGratis);
        u.setFechaFin(null);
        usuarioRepository.save(u);

        Cuenta cuenta = new Cuenta(dto.getEmail(), dto.getUsername(), 1);
        cuentaRepository.save(cuenta);

        return toDTO(u);
    }

    @Transactional
    public UsuarioDTO update(String email, UsuarioUpdateDTO dto) {
        Usuario u = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        if (dto.getEnabled() != null) {
            u.setEnabled(dto.getEnabled());
        }
        if (dto.getTipoUsuario() != null) {
            u.setTipoUsuario(TipoUsuario.valueOf(dto.getTipoUsuario().toUpperCase()));
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPassword(dto.getPassword());
        }

        return toDTO(usuarioRepository.save(u));
    }
    
    public void solicitarRecuperacion(String email) {
        Usuario usuario = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        int token = (int)(Math.random() * 900000) + 100000;
        usuario.setResetToken(token);
        usuario.setResetTokenExpira(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        emailService.enviarTokenRecuperacion(email, token);
    }

    public boolean validarToken(String email, Integer token) {
        Usuario usuario = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getResetToken() == null || !usuario.getResetToken().equals(token))
            return false;

        if (LocalDateTime.now().isAfter(usuario.getResetTokenExpira()))
            return false;

        return true;
    }
    
    public void confirmarPago(String email, String nombrePlan) {
        Usuario usuario = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Plan plan = planRepository.findById(nombrePlan)
            .orElseThrow(() -> new RuntimeException("Plan no encontrado"));

        emailService.enviarConfirmacionPago(email, plan.getNombrePlan(), plan.getPrecio());
    }
    
    
}
