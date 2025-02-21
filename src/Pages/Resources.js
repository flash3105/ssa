import React, { useState, useEffect } from "react";
import { Form, Input, Select, Upload, Button, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Sidebar from "../Components/Sidebar";
import './Resources.css';

const { Option } = Select;
const { TextArea } = Input;

const Resources = () => {
  const [coursesData, setCoursesData] = useState({});
  const [department, setDepartment] = useState(null);
  const [year, setYear] = useState(null);
  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/courses.json");
        const data = await response.json();
        setCoursesData(data.EBE_Courses);
      } catch (error) {
        message.error("Failed to load courses.");
      }
    };

    fetchCourses();
  }, []);

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    setYear(null);
    setCourse(null);
  };

  const handleYearChange = (value) => {
    setYear(value);
    setCourse(null);
  };

  const handleCourseChange = (value) => {
    setCourse(value);
  };

  const handleFileChange = (info) => {
    if (info.file) {
      console.log('File selected:', info.file); // Log the selected file
      message.success(`${info.file.name} uploaded successfully`);
      setFile(info.file);
    } else {
      console.log("No file selected");
      message.error(`${info.file?.name || 'File'} upload failed.`);
    }
  };

  useEffect(() => {
    if (file) {
      console.log('File state updated:', file); // Log when the file state is updated
      message.success(`${file.name} uploaded successfully`);
    }
  }, [file]);

  const handleSubmit = async () => {
    console.log('Selected file:', file);  // Log the file object before submission
    if (!department || !year || !course || !file || !resourceName || !description) {
      message.error("Please fill in all fields and upload a file.");
      return;
    }

    setLoading(true); // Start loading spinner

    const formData = new FormData();
    formData.append("department", department);
    formData.append("year", year);
    formData.append("course", course);
    formData.append("name", resourceName);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload-resource", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        message.success("Resource uploaded successfully!");
        // Reset form fields
        setDepartment(null);
        setYear(null);
        setCourse(null);
        setResourceName("");
        setDescription("");
        setFile(null);
      } else {
        message.error("Failed to upload resource.");
      }
    } catch (error) {
      message.error("Error uploading file.");
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="Resource Name">
        <Input 
          placeholder="Enter resource name" 
          value={resourceName} 
          onChange={(e) => setResourceName(e.target.value)} 
        />
      </Form.Item>

      <Form.Item label="Description">
        <TextArea 
          placeholder="Enter a brief description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows={4} 
        />
      </Form.Item>

      <Form.Item label="Select Department">
        <Select onChange={handleDepartmentChange} placeholder="Select Department" value={department}>
          {Object.keys(coursesData).map((dept) => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
      </Form.Item>

      {department && (
        <Form.Item label="Select Year">
          <Select onChange={handleYearChange} placeholder="Select Year" value={year}>
            {Object.keys(coursesData[department]).map((yr) => (
              <Option key={yr} value={yr}>{`Year ${yr}`}</Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {year && (
        <Form.Item label="Select Course">
          <Select onChange={handleCourseChange} placeholder="Select Course" value={course}>
            {coursesData[department]?.[year]?.map((crs) => (
              <Option key={crs} value={crs}>{crs}</Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item label="Upload File">
        <Upload beforeUpload={() => false} onChange={handleFileChange} showUploadList={false}>
          <Button icon={<UploadOutlined />} disabled={loading}>
            {loading ? <Spin size="small" /> : "Click to Upload"}
          </Button>
        </Upload>
        {file && <p>Selected file: {file.name}</p>}
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        disabled={loading || !resourceName || !description}
      >
        {loading ? <Spin size="small" /> : "Submit"}
      </Button>
    </Form>
  );
};

export default Resources;
