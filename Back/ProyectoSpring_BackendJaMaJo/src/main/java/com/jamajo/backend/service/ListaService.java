package com.jamajo.backend.service;

import com.jamajo.backend.DTO.ContenidoDTO;
import com.jamajo.backend.DTO.ListaCreateDTO;
import com.jamajo.backend.DTO.ListaDTO;
import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Cuenta;
import com.jamajo.backend.entity.Lista;
import com.jamajo.backend.entity.ListaTieneContenido;
import com.jamajo.backend.entity.Usuario;
import com.jamajo.backend.repository.ContenidoRepository;
import com.jamajo.backend.repository.CuentaRepository;
import com.jamajo.backend.repository.ListaRepository;
import com.jamajo.backend.repository.ListaTieneContenidoRepository;
import com.jamajo.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ListaService {

    private final ListaRepository listaRepository;
    private final ListaTieneContenidoRepository ltcRepository;
    private final CuentaRepository cuentaRepository;
    private final ContenidoRepository contenidoRepository;
    private final UsuarioRepository usuarioRepository;

    public ListaService(ListaRepository listaRepository,
                        ListaTieneContenidoRepository ltcRepository,
                        CuentaRepository cuentaRepository,
                        ContenidoRepository contenidoRepository,
                        UsuarioRepository usuarioRepository) {
        this.listaRepository = listaRepository;
        this.ltcRepository = ltcRepository;
        this.cuentaRepository = cuentaRepository;
        this.contenidoRepository = contenidoRepository;
        this.usuarioRepository = usuarioRepository;
    }
    public ListaDTO toDTO(Lista l) {
    	return new ListaDTO(l.getId(), l.getCuenta().getIdCuenta(), l.getNombre());
    }

    public ContenidoDTO contenidoToDTO(Contenido c) {
        return new ContenidoDTO(
            c.getId(), c.getIdApi(), c.getIdTmdb(), c.getTituloPrincipal(),
            c.getDirector() != null ? c.getDirector().getNombre() : null,
            c.getTipoContenido(), c.getDescripcion(), c.getFecha(),
            c.getImagenUrl(), c.getNota(), c.getNVotos(), c.getTrailerUrl()
        );
    }

    public List<ListaDTO> findByIdCuenta(Long idCuenta) {
        return listaRepository.findByCuentaIdCuenta(idCuenta)
                .stream().map(this::toDTO).toList();
    }

    public List<ContenidoDTO> findContenidos(Long idLista) {
        return ltcRepository.findByListaId(idLista)
                .stream()
                .map(ltc -> contenidoToDTO(ltc.getContenido()))
                .toList();
    }

    @Transactional
    public ListaDTO create(Long idCuenta, ListaCreateDTO dto) {
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada: " + idCuenta));

        Usuario usuario = usuarioRepository.findById(cuenta.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String plan = usuario.getPlan().getNombrePlan().toUpperCase();
        long limite = switch (plan) {
            case "GRATIS"    -> 1;
            case "ANUNCIOS"  -> 3;
            case "ESTANDAR"  -> 6;
            case "PRO"       -> Long.MAX_VALUE;
            default          -> 1;
        };

        long actuales = listaRepository.countByCuentaIdCuenta(idCuenta);
        if (actuales >= limite)
            throw new RuntimeException("Has alcanzado el límite de listas de tu plan (" + limite + ")");

        Lista l = new Lista();
        l.setCuenta(cuenta);
        l.setNombre(dto.getNombre());
        return toDTO(listaRepository.save(l));
    }

    @Transactional
    public ListaDTO rename(Long idLista, ListaCreateDTO dto) {
        Lista l = listaRepository.findById(idLista)
                .orElseThrow(() -> new RuntimeException("Lista no encontrada: " + idLista));
        l.setNombre(dto.getNombre());
        return toDTO(listaRepository.save(l));
    }

    @Transactional
    public void delete(Long idLista) {
        listaRepository.deleteById(idLista);
    }

    @Transactional
    public void addContenido(Long idLista, Long idContenido) {
        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new RuntimeException("Lista no encontrada: " + idLista));
        Contenido contenido = contenidoRepository.findById(idContenido)
                .orElseThrow(() -> new RuntimeException("Contenido no encontrado: " + idContenido));

        if (ltcRepository.findByListaIdAndContenidoId(idLista, idContenido).isPresent())
            throw new RuntimeException("El contenido ya está en la lista");

        ListaTieneContenido ltc = new ListaTieneContenido();
        ltc.setLista(lista);
        ltc.setContenido(contenido);
        ltcRepository.save(ltc);
    }

    @Transactional
    public void removeContenido(Long idLista, Long idContenido) {
        ltcRepository.deleteByListaIdAndContenidoId(idLista, idContenido);
    }

    public long countByIdCuenta(Long idCuenta) {
        return listaRepository.countByCuentaIdCuenta(idCuenta);
    }
}