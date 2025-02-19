import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Table, Button, Input, Select, Modal } from "antd";
import { Dropdown, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import "./Admin.css";

const { Option } = Select;

const AdminDashboard = () => {
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");

  const [logs, setLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const venues = ["Room A101", "Room B202", "Library", "Online"];
  const status =["Pending","Completed","Cancelled"];
  const menu = (record) => (
    <Menu>
      <Menu.Item key="viewProfile" onClick={() => handleViewProfile(record.student_email)}>
        View Profile
      </Menu.Item>
      <Menu.Item key="reschedule" onClick={() => handleStatusChange(record._id, "confirmed", "appoint")}>
        Reschedule
      </Menu.Item>
      <Menu.Item key="cancel" onClick={() => handleStatusChange(record._id, "cancelled", "appoint")} danger>
        Cancel
      </Menu.Item>
    </Menu>
  );
  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;

      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://127.0.0.1:5000/api/advisor/logs",
          {
            params: { advisor_email: email, search: searchTerm, status: statusFilter },
          }
        );

        if (!Array.isArray(data)) {
          setError("Unexpected response format");
          return;
        }

        const unconfirmedLogs = data.filter((log) => !log.confirmed);
        const confirmedAppointments = data.filter((log) => log.confirmed);

        setLogs(unconfirmedLogs);
        setAppointments(confirmedAppointments);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email, searchTerm, statusFilter]);

  const handleViewProfile = async (studentEmail) => {
    if (!studentEmail) {
      setError("Student email is missing.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/get_summary/${studentEmail}`);
      setProfileData(response.data);
      setIsProfileVisible(true);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/appointment/status/${id}`, {
        status: newStatus,
      });
      setAppointments(appointments.map((appt) => (appt._id === id ? { ...appt, status: newStatus } : appt)));
    } catch (err) {
      setError("Error updating status");
      console.error("Axios error:", err);
    }
  };
  const handleStatusChange = async (id, newStatus, type) => {
    try {
      const endpoint = type === "appoint" && newStatus === "Pending"
        ? `/api/appointment/confirm/${id}`
        : `/api/${type}/${id}`;

      await axios.put(`http://127.0.0.1:5000${endpoint}`, {
        status: newStatus,
        reviewed_by: email,
      });
     
      const updateState = (items) =>
        items.map((item) => (item._id === id ? { ...item, status: newStatus } : item));

      type === "logs" ? setLogs(updateState(logs)) : setAppointments(updateState(appointments));
    } catch (err) {
      setError("Error updating status");
      console.error(err);
    }
  };

  const handleVenueChange = async (id, newVenue) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/appointment/venue/${id}`, {
        venue: newVenue,
      });
      setAppointments(appointments.map((appt) => (appt._id === id ? { ...appt, venue: newVenue } : appt)));
    } catch (err) {
      setError("Error updating venue");
      console.error("Axios error:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      return format(parseISO(dateString), "PP");
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  const logColumns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (text, record) => formatDate(record.date) + " • " + record.BookedTime,
    },
    { title: "Student Name", dataIndex: "student_name", key: "student_name" },
    { title: "Student Email", dataIndex: "student_email", key: "student_email" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "Module", dataIndex: "module", key: "module" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button onClick={() => handleStatusChange(record._id, "Pending", "appoint")} type="primary">
            Confirm
          </Button>
          <Button onClick={() => handleStatusChange(record._id, "cancelled", "appoint")} type="danger">
            Cancel
          </Button>
        </>
      ),
    },
  ];

  const appointmentColumns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (text, record) => formatDate(record.date) + " • " + record.BookedTime,
    },
    { title: "Student", dataIndex: "student_name", key: "student_name" },
    { title: "Student Email", dataIndex: "student_email", key: "student_email" },
    { title: "Details", dataIndex: "module", key: "module" },
    {
      title: "Venue",
      key: "venue",
      render: (text, record) => (
        <Select value={record.venue} onChange={(value) => handleVenueChange(record._id, value)}>
          {venues.map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      ),
    },
    { title: "Status", 
       key: "status" ,
       render:(text,record)=>(
        <Select value={record.status} onChange={(value) => handleStatusUpdate(record._id,value)}>
          {status.map((v)=>(
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
       ),

    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="viewProfile" onClick={() => handleViewProfile(record.student_email)}>
                View Profile
              </Menu.Item>
              <Menu.Item key="reschedule" onClick={() => handleStatusChange(record._id, "confirmed", "appoint")}>
                Reschedule
              </Menu.Item>
              <Menu.Item key="cancel" onClick={() => handleStatusChange(record._id, "cancelled", "appoint")} danger>
                Cancel
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button shape="circle" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <h1>Welcome, {name}!</h1>

      <div className="controls">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "200px", marginRight: "10px" }}
        />
        <Select value={statusFilter} onChange={(value) => setStatusFilter(value)} style={{ width: "200px" }}>
          <Option value="all">All Statuses</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </div>
    <p>Logs</p>
      <Table columns={logColumns} dataSource={logs} rowKey="_id" pagination={{ pageSize: 5 }} />
      <p>Appointments</p>
      <Table columns={appointmentColumns} dataSource={appointments} rowKey="_id" pagination={{ pageSize: 5 }} />

      <Modal
  title="Student Profile"
  open={isProfileVisible && profileData !== null} // Ensure profile data is available
  onCancel={() => setIsProfileVisible(false)}
  footer={null}
>
  {profileData ? <pre>{JSON.stringify(profileData, null, 2)}</pre> : "Loading profile..."}
</Modal>

    </div>
  );
};

export default AdminDashboard;
