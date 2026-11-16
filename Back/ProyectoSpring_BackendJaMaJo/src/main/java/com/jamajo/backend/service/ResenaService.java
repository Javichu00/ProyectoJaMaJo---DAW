package com.jamajo.backend.service;

import com.jamajo.backend.DTO.ResenaCreateDTO;
import com.jamajo.backend.DTO.ResenaDTO;
import com.jamajo.backend.DTO.ResenaUpdateDTO;
import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Cuenta;
import com.jamajo.backend.entity.Resena;
import com.jamajo.backend.entity.Usuario;
import com.jamajo.backend.enums.TipoUsuario;
import com.jamajo.backend.repository.ContenidoRepository;
import com.jamajo.backend.repository.CuentaRepository;
import com.jamajo.backend.repository.ResenaRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final CuentaRepository cuentaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ContenidoRepository contenidoRepository;

    public ResenaService(ResenaRepository resenaRepository, CuentaRepository cuentaRepository, UsuarioRepository usuarioRepository, ContenidoRepository contenidoRepository) {
        this.resenaRepository = resenaRepository;
        this.cuentaRepository = cuentaRepository;
        this.usuarioRepository = usuarioRepository;
        this.contenidoRepository = contenidoRepository;
    }

    public ResenaDTO toDTO(Resena r) {
        return new ResenaDTO(
            r.getIdResena(),
            r.getCuenta().getIdCuenta(),
            r.getContenido().getId(),
            r.getTexto(),
            r.getPuntuacion(),
            r.getFechaCreacion()
        );
    }

    public List<ResenaDTO> findByCuenta(Long idCuenta) {
        return resenaRepository.findByCuentaIdCuenta(idCuenta)
            .stream().map(this::toDTO).toList();
    }

    public List<ResenaDTO> findByContenido(Long idContenido) {
        return resenaRepository.findByContenidoId(idContenido)
            .stream().map(this::toDTO).toList();
    }

    public Double mediaByContenido(Long idContenido) {
        return resenaRepository.mediaByContenido(idContenido);
    }

    @Transactional
    public ResenaDTO create(ResenaCreateDTO dto) {
        if (dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5)
            throw new RuntimeException("La puntuación debe estar entre 1 y 5");

        Cuenta cuenta = cuentaRepository.findById(dto.getIdCuenta())
            .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));

        Contenido contenido = contenidoRepository.findById(dto.getIdContenido())
            .orElseThrow(() -> new RuntimeException("Contenido no encontrado"));

        if (resenaRepository.findByCuentaIdCuentaAndContenidoId(dto.getIdCuenta(), dto.getIdContenido()).isPresent())
            throw new RuntimeException("Ya existe una reseña de esta cuenta para este contenido");

        Resena resena = new Resena();
        resena.setCuenta(cuenta);
        resena.setContenido(contenido);
        resena.setTexto(dto.getTexto());
        resena.setPuntuacion(dto.getPuntuacion());

        return toDTO(resenaRepository.save(resena));
    }

    @Transactional
    public ResenaDTO update(Long idResena, Long idCuentaSolicitante, ResenaUpdateDTO dto) {
        Resena resena = resenaRepository.findById(idResena)
            .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        if (!resena.getCuenta().getIdCuenta().equals(idCuentaSolicitante))
            throw new RuntimeException("No tienes permiso para modificar esta reseña");

        if (dto.getTexto() != null && !dto.getTexto().isBlank())
            resena.setTexto(dto.getTexto());

        if (dto.getPuntuacion() != null) {
            if (dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5)
                throw new RuntimeException("La puntuación debe estar entre 1 y 5");
            resena.setPuntuacion(dto.getPuntuacion());
        }

        return toDTO(resenaRepository.save(resena));
    }

    @Transactional
    public void delete(Long idResena, Long idCuentaSolicitante) {
        Resena resena = resenaRepository.findById(idResena)
            .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        Cuenta cuentaSolicitante = cuentaRepository.findById(idCuentaSolicitante)
            .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));

        Usuario usuario = usuarioRepository.findById(cuentaSolicitante.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esCreador = resena.getCuenta().getIdCuenta().equals(idCuentaSolicitante);
        boolean esAdmin = usuario.getTipoUsuario() == TipoUsuario.ADMIN;

        if (!esCreador && !esAdmin)
            throw new RuntimeException("No tienes permiso para eliminar esta reseña");

        resenaRepository.deleteById(idResena);
    }
}