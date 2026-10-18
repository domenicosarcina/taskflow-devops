package com.taskmanager.backend;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.crypto.SecretKey;

public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = encoder.encode("provaPassword"); // DA MODIFICARE CON LA PASSWORD DESIDERATA

        System.out.println(hash);

        /*BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println(
                encoder.matches(
                        "provaPassword", // DA MODIFICARE CON LA PASSWORD DESIDERATA
                        "$2a$10$IEWSbhqmpKYmNJ6jEv.Jr.TeEFX7T5TW4vQmNndpJiUs5BCzbxixu"
                )
        );*/

        /*SecretKey key = Jwts.SIG.HS256.key().build();

        String base64Key =
                Encoders.BASE64.encode(key.getEncoded());

        System.out.println(base64Key);*/

    }
}