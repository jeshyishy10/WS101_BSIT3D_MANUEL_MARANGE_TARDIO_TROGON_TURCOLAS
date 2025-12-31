package lk.ijse.cmjd108.LostAndFoundSystem.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.Role;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Component
public class JWTUtils {

    public SecretKey key;
    private static final long EXPIRATION_TIME = 86400000L; //24 hours
    private final Map<String, Date> tokenBlacklist = new ConcurrentHashMap<>();

    public JWTUtils(){
        String secretString ="843567893696976453275974432697R634976R738467TR678T34865R6834R8763T478378637664538745673865783678548735687R3";
        byte[] keyBytes = Base64.getDecoder().decode(secretString.getBytes(StandardCharsets.UTF_8));
        this.key = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public String generateToken(User user){
        Map<String, Object> claims = new HashMap<>();

        // FIX: Handle null role safely
        if (user.getRole() != null) {
            claims.put("role", user.getRole().name());
        } else {
            claims.put("role", Role.USER.name()); // Default to USER
        }

        // Add more user info
        claims.put("userId", user.getUserId());
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails ){
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token){
        return extractClaims(token, Claims::getSubject);
    }

    public String extractUserRole(String token) {
        return extractClaims(token, claims -> claims.get("role", String.class));
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction){
        return claimsTFunction.apply(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload());
    }

    public boolean isTokenValid(String token, UserDetails userDetails){
        final String userName = extractEmail(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token){
        return extractClaims(token, Claims::getExpiration).before(new Date());
    }
}