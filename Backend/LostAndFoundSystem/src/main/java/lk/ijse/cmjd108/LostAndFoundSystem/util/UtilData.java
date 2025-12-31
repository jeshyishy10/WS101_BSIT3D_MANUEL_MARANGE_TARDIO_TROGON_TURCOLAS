package lk.ijse.cmjd108.LostAndFoundSystem.util;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class UtilData {
    //Generate Unique Ids for Users, Items and Requests
    public static String generateUserId(){
        return ("U" + UUID.randomUUID());
    }

    public static String generateItemId(){
        return ("I" + UUID.randomUUID());
    }

    public static String generateRequestId(){
        return ("R" + UUID.randomUUID());
    }

    //Generate Today and Now
    public static LocalDate generateToday(){
        return LocalDate.now();
    }

    public static Time generateNow(){
        return Time.valueOf(LocalTime.now());
    }

}
