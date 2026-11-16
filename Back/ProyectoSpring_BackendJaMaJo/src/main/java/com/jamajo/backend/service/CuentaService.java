package com.jamajo.backend.service;

import com.jamajo.backend.DTO.CuentaCreateDTO;
import com.jamajo.backend.DTO.CuentaDTO;
import com.jamajo.backend.DTO.CuentaUpdateDTO;
import com.jamajo.backend.entity.Cuenta;
import com.jamajo.backend.entity.Usuario;
import com.jamajo.backend.repository.CuentaRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CuentaService {

    private final CuentaRepository cuentaRepository;
    private final UsuarioRepository usuarioRepository;

    private static final Map<String, Integer> LIMITE_POR_PLAN = Map.of(
        "GRATIS",    1,
        "ANUNCIOS",  2,
        "ESTANDAR",  4,
        "PRO",       6
    );

    public CuentaService(CuentaRepository cuentaRepository, UsuarioRepository usuarioRepository) {
        this.cuentaRepository = cuentaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public CuentaDTO toDTO(Cuenta c) {
        return new CuentaDTO(c.getIdCuenta(), c.getEmail(), c.getUsername(), c.getIdFoto());
    }

    public List<CuentaDTO> findByEmail(String email) {
        return cuentaRepository.findByEmail(email)
            .stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional
    public CuentaDTO create(String email, CuentaCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        String nombrePlan = usuario.getPlan().getNombrePlan();
        int limite = LIMITE_POR_PLAN.getOrDefault(nombrePlan, 1);
        int cuentasActuales = cuentaRepository.findByEmail(email).size();

        if (cuentasActuales >= limite)
            throw new RuntimeException("Límite de cuentas alcanzado para el plan " + nombrePlan);

        Cuenta cuenta = new Cuenta(email, dto.getUsername(), dto.getIdFoto() != null ? dto.getIdFoto() : 1);
        return toDTO(cuentaRepository.save(cuenta));
    }

    @Transactional
    public CuentaDTO update(Long idCuenta, CuentaUpdateDTO dto) {
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new RuntimeException("Cuenta no encontrada: " + idCuenta));

        if (dto.getUsername() != null) cuenta.setUsername(dto.getUsername());
        if (dto.getIdFoto() != null) cuenta.setIdFoto(dto.getIdFoto());

        return toDTO(cuentaRepository.save(cuenta));
    }

    @Transactional
    public void delete(Long idCuenta, String password) {
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new RuntimeException("Cuenta no encontrada: " + idCuenta));

        Usuario usuario = usuarioRepository.findById(cuenta.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getPassword().equals(password))
            throw new RuntimeException("Contraseña incorrecta");

        cuentaRepository.deleteById(idCuenta);
    }
    
    public CuentaDTO findById(Long idCuenta) {
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
        return toDTO(cuenta);
    }
}