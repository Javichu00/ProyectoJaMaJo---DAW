package com.jamajo.backend.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmail(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom("tucorreo@gmail.com");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true);

            mailSender.send(mensaje);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar email: " + e.getMessage());
        }
    }
    
    public void enviarTokenRecuperacion(String destinatario, Integer token) {
        String asunto = "Recuperación de contraseña - JAM";
        String cuerpo = """
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2>Recuperar contraseña</h2>
                <p>Tu código de verificación es:</p>
                <h1 style="letter-spacing:8px;color:#6366f1">%s</h1>
                <p style="opacity:.6;font-size:.85rem">Expira en 15 minutos.</p>
            </div>
        """.formatted(token);
        enviarEmail(destinatario, asunto, cuerpo);
    }
    
    public void enviarConfirmacionPago(String destinatario, String nombrePlan, double precio) {
        String asunto = "Pago confirmado - JAM";
        String cuerpo = """
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2>Pago completado</h2>
                <p>Tu pago para el plan <strong>%s</strong> de <strong>%.2f€</strong> ha sido verificado y completado correctamente.</p>
                <p style="opacity:.6;font-size:.85rem">Si no has realizado este pago, contacta con nosotros.</p>
            </div>
        """.formatted(nombrePlan, precio);
        enviarEmail(destinatario, asunto, cuerpo);
    }
    
    public void enviarVerificacionRegistro(String destinatario, Integer token) {
        String asunto = "Verifica tu email - JAM";
        String cuerpo = """
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2>Bienvenido a JAM</h2>
                <p>Tu código de verificación es:</p>
                <h1 style="letter-spacing:8px;color:#6366f1">%s</h1>
                <p style="opacity:.6;font-size:.85rem">Expira en 15 minutos.</p>
            </div>
        """.formatted(token);
        enviarEmail(destinatario, asunto, cuerpo);
    }
    
    
}