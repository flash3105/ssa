import React, { useState, useEffect } from "react";
import { Form, Input, Select, Upload, Button, message, Spin, List, Tabs } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Sidebar from "../Components/Sidebar";
import './Resources.css';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Resources = () => {
  const [coursesData, setCoursesData] = useState({});
  const [department, setDepartment] = useState(null);
  const [year, setYear] = useState(null);
  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState([]); // To store fetched resources for archives view

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

  // Fetch resources when in "See Archives" tab
  useEffect(() => {
    if (course && department && year) {
      const fetchResources = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/resources/${course}`);
          const data = await response.json();
          setResources(data.resources); // Assume the response contains a "resources" array
        } catch (error) {
          message.error("Failed to load resources.");
        }
      };
      fetchResources();
    }
  }, [department, year, course]);

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
      setFile(info.file);
    }
  };

  const handleSubmit = async () => {
    if (!department || !year || !course || !file || !resourceName || !description) {
      message.error("Please fill in all fields and upload a file.");
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleEdit = (resourceId) => {
    console.log("Edit resource", resourceId);
  };

  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(`/api/delete-resource/${resourceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        message.success("Resource deleted successfully!");
        setResources(resources.filter(resource => resource.id !== resourceId));
      } else {
        message.error("Failed to delete resource.");
      }
    } catch (error) {
      message.error("Error deleting resource.");
    }
  };

  return (
    <div className="resources-container">
      <Sidebar />
      <div className="resources-content">
        <h2>{department ? `Manage Resources for ${department}` : "Choose a Department"}</h2>

        <Tabs defaultActiveKey="1" onChange={(key) => setDepartment(null)}>
          <TabPane tab="Upload" key="1">
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
          </TabPane>

          <TabPane tab="See Archives" key="2">
            <div>
              <Form layout="vertical">
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
              </Form>

              <List
                dataSource={resources}
                renderItem={(resource) => (
                  <List.Item
                    actions={[
                      <Button onClick={() => handleEdit(resource.id)} type="link">Edit</Button>,
                      <Button onClick={() => handleDelete(resource.id)} type="link" danger>Delete</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={resource.name}
                      description={resource.description}
                    />
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;