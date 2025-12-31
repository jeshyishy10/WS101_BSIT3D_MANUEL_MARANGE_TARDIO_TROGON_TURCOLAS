package lk.ijse.cmjd108.LostAndFoundSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
@ComponentScan(basePackages = "lk.ijse.cmjd108.LostAndFoundSystem")
public class LostAndFoundSystemApplication {

    public static void main(String[] args) {
        System.out.println("🚀 Starting Lost & Found System Backend...");
        SpringApplication.run(LostAndFoundSystemApplication.class, args);
        System.out.println("✅ Spring Boot started on port 8082!");
        System.out.println("📡 Available endpoints:");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/api/health");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/api/test");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/User/test");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/User/login (POST)");
        System.out.println("   - http://localhost:8082/LostAndFoundSystem/User/register (POST)");
    }

}