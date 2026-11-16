package com.jamajo.backend.controller;

import com.jamajo.backend.DTO.ResenaCreateDTO;
import com.jamajo.backend.DTO.ResenaDTO;
import com.jamajo.backend.DTO.ResenaUpdateDTO;
import com.jamajo.backend.service.ResenaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resenas")
public class ResenaController {

    private final ResenaService resenaService;

    public ResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    @GetMapping("/cuenta/{idCuenta}")
    public ResponseEntity<List<ResenaDTO>> getByCuenta(@PathVariable Long idCuenta) {
        return ResponseEntity.ok(resenaService.findByCuenta(idCuenta));
    }

    @GetMapping("/contenido/{idContenido}")
    public ResponseEntity<List<ResenaDTO>> getByContenido(@PathVariable Long idContenido) {
        return ResponseEntity.ok(resenaService.findByContenido(idContenido));
    }

    @GetMapping("/contenido/{idContenido}/media")
    public ResponseEntity<Double> getMedia(@PathVariable Long idContenido) {
        return ResponseEntity.ok(resenaService.mediaByContenido(idContenido));
    }

    @PostMapping
    public ResponseEntity<ResenaDTO> create(@RequestBody ResenaCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.create(dto));
    }

    @PutMapping("/{idResena}")
    public ResponseEntity<?> update(
            @PathVariable Long idResena,
            @RequestParam Long idCuenta,
            @RequestBody ResenaUpdateDTO dto) {
        try {
            return ResponseEntity.ok(resenaService.update(idResena, idCuenta, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/{idResena}")
    public ResponseEntity<?> delete(
            @PathVariable Long idResena,
            @RequestParam Long idCuenta) {
        try {
            resenaService.delete(idResena, idCuenta);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}