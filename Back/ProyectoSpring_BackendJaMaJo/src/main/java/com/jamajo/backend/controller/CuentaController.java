package com.jamajo.backend.controller;

import com.jamajo.backend.DTO.CuentaCreateDTO;
import com.jamajo.backend.DTO.CuentaDTO;
import com.jamajo.backend.DTO.CuentaUpdateDTO;
import com.jamajo.backend.service.CuentaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService service;

    public CuentaController(CuentaService service) {
        this.service = service;
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<CuentaDTO>> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(service.findByEmail(email));
    }

    @GetMapping("/id/{idCuenta}")
    public ResponseEntity<CuentaDTO> getById(@PathVariable Long idCuenta) {
        return ResponseEntity.ok(service.findById(idCuenta));
    }

    @PostMapping("/{email}")
    public ResponseEntity<CuentaDTO> create(@PathVariable String email, @RequestBody CuentaCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(email, dto));
    }

    @PutMapping("/{idCuenta}")
    public ResponseEntity<CuentaDTO> update(@PathVariable Long idCuenta, @RequestBody CuentaUpdateDTO dto) {
        return ResponseEntity.ok(service.update(idCuenta, dto));
    }

    @DeleteMapping("/{idCuenta}")
    public ResponseEntity<Void> delete(@PathVariable Long idCuenta, @RequestParam String password) {
        service.delete(idCuenta, password);
        return ResponseEntity.noContent().build();
    }
}