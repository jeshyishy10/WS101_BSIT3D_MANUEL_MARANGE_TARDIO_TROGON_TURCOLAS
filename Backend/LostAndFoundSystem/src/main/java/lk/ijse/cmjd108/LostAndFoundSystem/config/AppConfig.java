package lk.ijse.cmjd108.LostAndFoundSystem.config;

import lk.ijse.cmjd108.LostAndFoundSystem.util.JWTUtils;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setAmbiguityIgnored(true);
        System.out.println("✅ ModelMapper bean created in AppConfig");
        return modelMapper;
    }

    @Bean
    public JWTUtils jwtUtils() {
        System.out.println("✅ JWTUtils bean created in AppConfig");
        return new JWTUtils();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        System.out.println("✅ CORS configuration bean created in AppConfig");
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept")
                        .allowCredentials(true)
                        .maxAge(3600);
                System.out.println("✅ CORS configured for http://localhost:3000 in AppConfig");
            }
        };
    }
}