package com.jamajo.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jamajo.backend.DTO.UsuarioCreateDTO;
import com.jamajo.backend.DTO.UsuarioDTO;
import com.jamajo.backend.DTO.UsuarioUpdateDTO;
import com.jamajo.backend.email.VerificacionEmailService;
import com.jamajo.backend.service.UsuarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final VerificacionEmailService verificacionEmailService;

    public UsuarioController(UsuarioService usuarioService, VerificacionEmailService verificacionEmailService) {
        this.usuarioService = usuarioService;
        this.verificacionEmailService = verificacionEmailService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAll() {
        return ResponseEntity.ok(usuarioService.findAllDTO());
    }

    @GetMapping("/{email}")
    public ResponseEntity<UsuarioDTO> getByEmail(@PathVariable String email) {
        return usuarioService.findByEmailDTO(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{email}/{password}")
    public Boolean checkPassword(@PathVariable String email, @PathVariable String password) {
        return usuarioService.checkPassword(email, password);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody UsuarioCreateDTO dto) {
        if (!verificacionEmailService.estaVerificado(dto.getEmail()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Email no verificado");
        UsuarioDTO creado = usuarioService.create(dto);
        verificacionEmailService.limpiar(dto.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{email}")
    public ResponseEntity<UsuarioDTO> update(@PathVariable String email, @RequestBody UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(usuarioService.update(email, dto));
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> disable(@PathVariable String email) {
        usuarioService.update(email, new UsuarioUpdateDTO(false, null, null));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{email}/solicitar-recuperacion")
    public ResponseEntity<?> solicitarRecuperacion(@PathVariable String email) {
        try {
            usuarioService.solicitarRecuperacion(email);
            return ResponseEntity.ok("Código enviado");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{email}/validar-token")
    public ResponseEntity<?> validarToken(@PathVariable String email, @RequestBody Map<String, Integer> body) {
        Integer token = body.get("token");
        boolean valido = usuarioService.validarToken(email, token);
        if (valido)
            return ResponseEntity.ok("Token válido");
        else
            return ResponseEntity.badRequest().body("Token inválido o expirado");
    }

    @PostMapping("/{email}/confirmar-pago")
    public ResponseEntity<?> confirmarPago(@PathVariable String email, @RequestBody Map<String, String> body) {
        try {
            usuarioService.confirmarPago(email, body.get("plan"));
            return ResponseEntity.ok("Email de confirmación enviado");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/solicitar-verificacion")
    public ResponseEntity<?> solicitarVerificacion(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body("Email requerido");
        try {
            verificacionEmailService.solicitarVerificacion(email);
            return ResponseEntity.ok("Código enviado");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verificar-email")
    public ResponseEntity<?> verificarEmail(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Integer token = (Integer) body.get("token");
        if (email == null || token == null)
            return ResponseEntity.badRequest().body("Email y token requeridos");
        boolean valido = verificacionEmailService.verificar(email, token);
        if (valido)
            return ResponseEntity.ok("Email verificado");
        else
            return ResponseEntity.badRequest().body("Token inválido o expirado");
    }
}