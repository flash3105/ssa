import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const SuperUser = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Tutor" });
  const [courses, setCourses] = useState([]);  // To store subjects data
  const navigate = useNavigate();
const API_URL = "https://ssa-fyk5.onrender.com";
  // Fetch users and courses data
  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/adminP`);
      setUsers(response.data);
      console.log("Users data:", response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/path/to/courses.json"); // Update the path as needed
      setCourses(response.data);  // Assuming courses.json contains an array of subjects
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/users/delete/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await axios.put(`${API_URL}/api/users/editAdmin/${editingUser._id}`, editingUser);
        setUsers(users.map((user) => (user._id === editingUser._id ? editingUser : user)));
      } else {
        const response = await axios.post("/api/users", newUser);
        setUsers([...users, response.data]);
      }
      setModalVisible(false);
      setEditingUser(null);
      setNewUser({ name: "", email: "", role: "Tutor" });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div>
      {/* Back Navigator */}
      <Button
        type="default"
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)} // Navigates back to the previous page
      >
        Back
      </Button>
      <h2>SuperUser Panel</h2>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Add User
      </Button>
      <Table
        dataSource={users}
        rowKey="_id"
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Role", dataIndex: "role", key: "role" },
          { title: "Subject", dataIndex: "subject", key: "subject" },
          { title: "Student No.", dataIndex: "studentNo", key: "studentNo" },
          { title: "Department", dataIndex: "department", key: "department" },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <>
                <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
                  Edit
                </Button>
                <Button danger onClick={() => handleDelete(record._id)}>
                  Delete
                </Button>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
        }}
        onOk={handleSave}
      >
        <Input
          placeholder="Name"
          value={editingUser ? editingUser.name : newUser.name}
          onChange={(e) =>
            editingUser ? setEditingUser({ ...editingUser, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })
          }
        />
        <Input
          placeholder="Email"
          value={editingUser ? editingUser.email : newUser.email}
          onChange={(e) =>
            editingUser ? setEditingUser({ ...editingUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })
          }
        />
        <Select
          value={editingUser ? editingUser.role : newUser.role}
          onChange={(value) =>
            editingUser ? setEditingUser({ ...editingUser, role: value }) : setNewUser({ ...newUser, role: value })
          }
          style={{ width: "100%", marginTop: 8 }}
        >
          <Option value="Tutor">Tutor</Option>
          <Option value="Academic Advisor">Academic Advisor</Option>
        </Select>
        <Input
          placeholder="Student Number"
          value={editingUser ? editingUser.studentNo : ""}
          onChange={(e) =>
            editingUser ? setEditingUser({ ...editingUser, studentNo: e.target.value }) : null
          }
          style={{ marginTop: 8 }}
        />
        <Input
          placeholder="Department"
          value={editingUser ? editingUser.department : ""}
          onChange={(e) =>
            editingUser ? setEditingUser({ ...editingUser, department: e.target.value }) : null
          }
          style={{ marginTop: 8 }}
        />
        <Select
          value={editingUser ? editingUser.subject : undefined}
          onChange={(value) =>
            editingUser ? setEditingUser({ ...editingUser, subject: value }) : null
          }
          style={{ width: "100%", marginTop: 8 }}
        >
          {courses.map((course, index) => (
            <Option key={index} value={course}>
              {course}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default SuperUser;
