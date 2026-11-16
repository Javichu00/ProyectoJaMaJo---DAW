package com.jamajo.backend.email;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificacionEmailService {

    private final EmailService emailService;
    private final Map<String, Object[]> pendientes = new ConcurrentHashMap<>();

    public VerificacionEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void solicitarVerificacion(String email) {
        int token = 100000 + new Random().nextInt(900000);
        LocalDateTime expira = LocalDateTime.now().plusMinutes(15);
        pendientes.put(email, new Object[]{token, expira});
        emailService.enviarVerificacionRegistro(email, token);
    }

    public boolean verificar(String email, int token) {
        Object[] datos = pendientes.get(email);
        if (datos == null) return false;
        int tokenGuardado = (int) datos[0];
        LocalDateTime expira = (LocalDateTime) datos[1];
        if (LocalDateTime.now().isAfter(expira)) {
            pendientes.remove(email);
            return false;
        }
        if (tokenGuardado != token) return false;
        return true;
    }

    public boolean estaVerificado(String email) {
        Object[] datos = pendientes.get(email);
        if (datos == null) return false;
        LocalDateTime expira = (LocalDateTime) datos[1];
        return !LocalDateTime.now().isAfter(expira);
    }

    public void limpiar(String email) {
        pendientes.remove(email);
    }
}