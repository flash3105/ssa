import React, { useState } from "react";
import { Form, Input, Radio, Button, message } from "antd";
import axios from "axios";  // To send the form data to the API
import './Survey.css';

const FeedbackForm = ({ studentNumber, advisorEmail, module,onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Add student number and advisor email to form values before submitting
      const feedbackData = { ...values, studentNumber, advisorEmail,module };
      
      // Send the form data to the API
      const response = await axios.post("http://127.0.0.1:5000/api/feedback", feedbackData);
      if (response.status === 200) {
        message.success("Feedback submitted successfully!");
        form.resetFields();
        onClose(); // Close the feedback form after successful submission
      }
    } catch (error) {
      message.error("Failed to submit feedback, please try again.");
    }
  };

  return (
    <div className="feedback-form-container" style={{ maxWidth: 600, margin: "auto", padding: "20px" }}>
      <h2>Feedback Form</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* Question 1: Did the session meet your needs? */}
        <Form.Item
          label="Did the session meet your needs?"
          name="sessionMetNeeds"
          rules={[{ required: true, message: "Please answer this question." }]}
        >
          <Radio.Group>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Question 2: Would you like further support? */}
        <Form.Item
          label="Would you like further support?"
          name="furtherSupport"
          rules={[{ required: true, message: "Please answer this question." }]}
        >
          <Radio.Group>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Additional Questions */}
        <Form.Item label="How would you rate the session overall?" name="sessionRating">
          <Radio.Group>
            <Radio value="excellent">Excellent</Radio>
            <Radio value="good">Good</Radio>
            <Radio value="average">Average</Radio>
            <Radio value="poor">Poor</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="What could be improved?" name="improvementSuggestions">
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* Section for Notes */}
        <Form.Item label="Additional Notes" name="additionalNotes">
          <Input.TextArea rows={4} placeholder="Write your comments or suggestions here..." />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Feedback
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeedbackForm;
