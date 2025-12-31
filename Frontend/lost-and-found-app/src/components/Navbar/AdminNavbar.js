import { Link, useParams, useNavigate } from 'react-router-dom';
import './Navbar.css';
import ProfileIcon from '../Pictures/profileicon.png';

const AdminNavbar = () => {
    const userId = localStorage.getItem('userId');
    
    const navigate = useNavigate();

    const handleLogout = () =>{
        
        alert("Logged out successfully");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("isLogin");
        navigate(`/`)
        
    }
    
    return (
        <nav class="navbar navbar-expand-lg" style={{backgroundColor: '#b6a194'}}>
            <a class="navbar-brand" href="/AdminHome"><h3>Lost & Found System</h3></a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/AdminHome">HOME</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="/Users">USERS</a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link" href="/ItemList">ITEMS</a>
                    </li>
                    
                    <li class="nav-item">
                        <a class="nav-link" href="/RequestList">REQUESTS</a>
                    </li>
                    
                    </ul>
            </div>

            <Link to={`/Profile/${userId}`}><img src={ProfileIcon} style={{width: '50px', height: '50px'}}/></Link>
            
            <div className='endbtn'>
                <form class="form-inline my-2 my-lg-0">
                    <button class="logout" type="submit" onClick={handleLogout}>Logout</button>
                </form>
            </div>
                    
        </nav>
    
    )
}

export default AdminNavbar;