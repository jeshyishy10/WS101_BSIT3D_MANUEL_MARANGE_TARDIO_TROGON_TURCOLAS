import React,{useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import AdminNavbar from "../Navbar/AdminNavbar";


function RegisteredUsers() {
    const [userInfo, setUserInfo] = useState([]); 
    const [error, setError] = useState();

    const navigate = useNavigate();

    const token = localStorage.getItem('token');


    useEffect(() => {
        
        fetchUserInfo();
    }, []);

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length !== 3) return "Invalid Date";
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
        return date.toLocaleDateString(); 
    };

    const handleDeleteClick = (userId) => {
        const confirmed = window.confirm("Do you want to delete this user?");
    
        if (confirmed) {
            console.log("Token:", token);
            console.log("Deleting user ID:", userId);

            UserService.deleteUser(userId, token)
                .then(() => {
                    console.log("User deleted successfully");
                    fetchUserInfo(); // Refresh the list
                })
                .catch((error) => {
                    console.error('Error deleting user:', error.response?.data || error.message);
                });
        }
    };

    const fetchUserInfo = async () => {
        try {
            const response = await UserService.getAllUsers(token);
            console.log("API Response:", response);
            setUserInfo(response);
           
        } catch (err) {
            console.error("Error fetching user information:", err);
            setError(err.message || "An error occurred.");
        }
    };

    return(
        <div>
            <AdminNavbar></AdminNavbar>
        <div className="table">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h1 style={{textAlign: 'center', color: '	#3e3530', marginBottom: '2%', fontWeight: 'bold', marginTop: '2%'}}>Users' Details</h1>
            
            <div className='col-sm-8 py-2 px-5 offset-2 shadow' id='Body2' style={{width: '85%', marginLeft: '5%', marginRight: '5%'}}>
            <table className="table">
                <thead className="thead-dark">
                <tr>
                    <th scope="col">UserID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Department</th>
                    <th scope="col">Role</th>
                    <th scope="col">Email</th>
                    <th scope="col">Registered Date</th>
                    <th scope="col">Registered Time</th>
                </tr>
                </thead>

                <tbody>
                {userInfo && userInfo.length > 0 ? (
                    userInfo.map((user, index) => (
                        <tr key={user.userId || index}>
                            <td scope="row">{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.department}</td>
                                <td>{user.role}</td>
                                <td>{user.email}</td>
                                <td>{formatDate(user.registeredDate)}</td>
                                <td>{user.registeredTime}</td>
                                <td>
                                    <button style={{
                                        backgroundColor: '#FF3F33',
                                        borderColor: '#FF3F33',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}onClick={() => handleDeleteClick(user.userId)}>Delete</button>                                       
                                </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center" }}>
                                No Users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}

export default RegisteredUsers;