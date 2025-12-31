import React,{useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Navbar/AdminNavbar";
import RequestService from "../../services/RequestService";

function RequestList() {
    const [requestInfo, setRequestInfo] = useState([]); 
    const [error, setError] = useState();

    const navigate = useNavigate();

    const token = localStorage.getItem('token');


    useEffect(() => {
        
        fetchRequestInfo();
    }, []);

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length !== 3) return "Invalid Date";
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
        return date.toLocaleDateString(); 
    };

        const handleApproveClick = (requestId) => {
        const confirmed = window.confirm("Do you want to approve this request?");
    
        if (confirmed) {

            RequestService.approveRequest(requestId, token)
                .then(() => {
                    alert("Request approved successfully");
                    fetchRequestInfo(); // Refresh the list
                })
                .catch((error) => {
                    console.error('Error approving request:', error.response?.data || error.message);
                });
        }
    };

    const handleRejectClick = (requestId) => {
        const confirmed = window.confirm("Do you want to reject this request?");
    
        if (confirmed) {

            RequestService.rejectRequest(requestId, token)
                .then(() => {
                    alert("Request rejected successfully");
                    fetchRequestInfo(); // Refresh the list
                })
                .catch((error) => {
                    console.error('Error rejecting request:', error.response?.data || error.message);
                });
        }
    };

    const fetchRequestInfo = async () => {
        try {
            const response = await RequestService.getAllRequests(token);
            console.log("API Response:", response);
            setRequestInfo(response);
           
        } catch (err) {
            console.error("Error fetching request information:", err);
            setError(err.message || "An error occurred.");
        }
    };

    return(
        <div>
            <AdminNavbar></AdminNavbar>
        <div className="table">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h1 style={{textAlign: 'center', color: '	#3e3530', marginBottom: '2%', fontWeight: 'bold', marginTop: '2%'}}>Requests' Details</h1>
            
            <div className='col-sm-8 py-2 px-5 offset-2 shadow' id='Body2' style={{width: '85%', marginLeft: '5%', marginRight: '5%'}}>
            <table className="table">
                <thead className="thead-dark">
                <tr>
                    <th scope="col">Request ID</th>
                    <th scope="col">User ID</th>
                    <th scope="col">Item ID</th>
                    <th scope="col">Requested Date</th>
                    <th scope="col">Approved Date</th>
                    <th scope="col">Status</th>
                </tr>
                </thead>

                <tbody>
                {requestInfo && requestInfo.length > 0 ? (
                    requestInfo.map((request, index) => (
                        <tr key={request.requestId || index}>
                            <td scope="row">{request.requestId}</td>
                                <td>{request.user}</td>
                                <td>{request.item}</td>
                                <td>{formatDate(request.requestDate)}</td>
                                <td>{request.approvedDate ? formatDate(request.approvedDate) : "Not Approved"}</td>
                                <td>{request.status}</td>

                                {request.status !== 'APPROVED' &&
                                <td>
                                    <button style={{
                                        backgroundColor: 'cadetblue',
                                        borderColor: 'cadetblue',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}onClick={() => handleApproveClick(request.requestId)}>Approve</button>                                       
                                </td>}

                                {request.status !== 'APPROVED' &&
                                <td>
                                    <button style={{
                                        backgroundColor: '#FF3F33',
                                        borderColor: '#FF3F33',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}onClick={() => handleRejectClick(request.requestId)}>Reject</button>                                       
                                </td>}
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center" }}>
                                No Requests Found.
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

export default RequestList;