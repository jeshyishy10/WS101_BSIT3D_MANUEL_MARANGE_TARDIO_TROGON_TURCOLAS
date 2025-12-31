import React from 'react'
import { Link } from 'react-router-dom';
import AdminNavbar from '../Navbar/AdminNavbar';
import HomeImg from '../Pictures/img3.png';

const AdminHome = () => {
  console.log(localStorage.getItem("workEmail"))
  console.log(localStorage.getItem("mohArea"))
  return (
    <div>
      <AdminNavbar></AdminNavbar>
      <br/>
      
      <h2 className='ha5' style={{textAlign: 'center'}}>Welcome to the Admin Dashboard of the <br></br> Lost and Found Management System!</h2>
     
     <div className="row" style={{padding:'3% 10% 3% 10%'}}>
     <div className="col">
     <img src={HomeImg} className="img-fluid" style={{width: '70%'}}/>
     </div>

     <div className="col" style={{margin: '3% 0% 3% 0%'}}>
     <p className='container' style={{fontSize: 'large', textAlign: 'justify'}}>
        As an administrator, you have full control over the platform, including the ability to manage user accounts, oversee 
        reported lost and found items, and handle item claim requests. This system ensures transparency and accountability by 
        allowing you to approve or reject item requests, assign roles to new users, and monitor the status of all ongoing operations. 
        Stay informed with real-time data, ensure rightful ownership of found items, and maintain the integrity of the 
        process — all from this centralized admin interface.
      </p><br></br>
     </div>
     </div>
      
    </div>
  )
}

export default AdminHome;
