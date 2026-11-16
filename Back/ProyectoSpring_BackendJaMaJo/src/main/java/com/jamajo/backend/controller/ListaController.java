package com.jamajo.backend.controller;

import com.jamajo.backend.DTO.ContenidoDTO;
import com.jamajo.backend.DTO.ListaCreateDTO;
import com.jamajo.backend.DTO.ListaDTO;
import com.jamajo.backend.service.ListaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listas")
public class ListaController {

    private final ListaService service;

    public ListaController(ListaService service) {
        this.service = service;
    }

    // GET /api/listas/cuenta/3
    @GetMapping("/cuenta/{idCuenta}")
    public ResponseEntity<List<ListaDTO>> getByIdCuenta(@PathVariable Long idCuenta) {
        return ResponseEntity.ok(service.findByIdCuenta(idCuenta));
    }

    // GET /api/listas/5/contenidos
    @GetMapping("/{idLista}/contenidos")
    public ResponseEntity<List<ContenidoDTO>> getContenidos(@PathVariable Long idLista) {
        return ResponseEntity.ok(service.findContenidos(idLista));
    }

    // POST /api/listas/cuenta/3
    @PostMapping("/cuenta/{idCuenta}")
    public ResponseEntity<ListaDTO> create(@PathVariable Long idCuenta,
                                           @RequestBody ListaCreateDTO dto) {
        return ResponseEntity.ok(service.create(idCuenta, dto));
    }

    // PUT /api/listas/5
    @PutMapping("/{idLista}")
    public ResponseEntity<ListaDTO> rename(@PathVariable Long idLista,
                                           @RequestBody ListaCreateDTO dto) {
        return ResponseEntity.ok(service.rename(idLista, dto));
    }

    // DELETE /api/listas/5
    @DeleteMapping("/{idLista}")
    public ResponseEntity<Void> delete(@PathVariable Long idLista) {
        service.delete(idLista);
        return ResponseEntity.noContent().build();
    }

    // POST /api/listas/5/contenidos/42
    @PostMapping("/{idLista}/contenidos/{idContenido}")
    public ResponseEntity<Void> addContenido(@PathVariable Long idLista,
                                              @PathVariable Long idContenido) {
        service.addContenido(idLista, idContenido);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/listas/5/contenidos/42
    @DeleteMapping("/{idLista}/contenidos/{idContenido}")
    public ResponseEntity<Void> removeContenido(@PathVariable Long idLista,
                                                 @PathVariable Long idContenido) {
        service.removeContenido(idLista, idContenido);
        return ResponseEntity.noContent().build();
    }

    // GET /api/listas/cuenta/3/contar
    @GetMapping("/cuenta/{idCuenta}/contar")
    public ResponseEntity<Long> count(@PathVariable Long idCuenta) {
        return ResponseEntity.ok(service.countByIdCuenta(idCuenta));
    }
}