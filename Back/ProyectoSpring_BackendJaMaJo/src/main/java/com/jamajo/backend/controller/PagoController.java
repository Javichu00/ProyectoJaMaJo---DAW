package com.jamajo.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jamajo.backend.DTO.PagoCreateDTO;
import com.jamajo.backend.DTO.PagoDTO;
import com.jamajo.backend.service.PagoService;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }
    
    @GetMapping
    public ResponseEntity<List<PagoDTO>> getAll() {
        return ResponseEntity.ok(pagoService.findAll());
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<PagoDTO>> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(pagoService.findByEmail(email));
    }

    @PostMapping("/{email}")
    public ResponseEntity<PagoDTO> create(@PathVariable String email, @RequestBody PagoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.create(email, dto));
    }
}