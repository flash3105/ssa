import React, { useEffect, useState, useRef } from "react";
import { Card, Statistic, Row, Col, Table, Spin,Button } from "antd";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Create ref for D3 chart
  const pieChartRef = useRef(null);

  useEffect(() => {
    setLoading(true); // Set loading to true before the fetch call
  
    // Fetch analytics data from the API
    fetch("http://127.0.0.1:5000/api/analytics")
      .then((response) => response.json())
      .then((result) => {
        setAnalytics(result);
        console.log(result);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false); // Handle error and stop loading
      });
  }, []);
  

  // Prepare data for the department distribution table
  const departmentData = Object.entries(analytics.survey_department_counts || {}).map(
    ([department, count]) => ({ department, count })
  );

  // Prepare data for course challenges, needs tutor, and emotional state
  const courseChallengesData = Object.entries(analytics.course_challenges || {}).map(
    ([challenge, count]) => ({ challenge, count })
  );
  const needsTutorData = Object.entries(analytics.needs_tutor || {}).map(
    ([need, count]) => ({ need, count })
  );
  const emotionalStateData = Object.entries(analytics.emotional_state || {}).map(
    ([state, count]) => ({ state, count })
  );

  useEffect(() => {
    if (analytics.most_common_department) {
      // Map the most_common_department data into the format D3 expects
      const data = analytics.most_common_department.map(([label, value]) => ({
        label,
        value,
      }));
  
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;
  
      const svg = d3.select(pieChartRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
  
      const color = d3.scaleOrdinal(d3.schemeCategory10);
  
      const pie = d3.pie().value((d) => d.value);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
  
      const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");
  
      arcs.append("path")
        .attr("d", arc)
        .style("fill", (d) => color(d.data.label));
  
      arcs.append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text((d) => d.data.label);
    }
  }, [analytics]);
  

  return (

    
    <div className="p-4">
        {/* Back Navigator */}
        <Button
        type="default"
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)} // Navigates back to the previous page
      >
        Back
      </Button>
      <Row gutter={16}>
        {/* Total Logs */}
        <Col span={8}>
          <Card>
            <Statistic title="Total Logs" value={analytics.total_logs} />
          </Card>
        </Col>

        {/* Most Common Department */}
        <Col span={8}>
          <Card>
            <Statistic
              title="Most Common Department"
              value={analytics.most_common_department?.length ? analytics.most_common_department[0][0] : "No Data"}
              suffix={`(${analytics.most_common_department?.length ? analytics.most_common_department[0][1] : 0})`}
            />
          </Card>
        </Col>

        {/* Pie Chart of Department Distribution */}
        <Col span={8}>
          <Card title="Department Distribution">
            {analytics.survey_department_counts ? (
              <svg ref={pieChartRef}></svg>
            ) : (
              <div>No department data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Department Data */}
        <Col span={8}>
          <Card title="Survey Department Distribution">
            <Table
              dataSource={departmentData.length ? departmentData : []}
              columns={[
                { title: "Department", dataIndex: "department", key: "department" },
                { title: "Count", dataIndex: "count", key: "count" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        {/* Course Challenges */}
        <Col span={8}>
          <Card title="Course Challenges">
            <Table
              dataSource={courseChallengesData.length ? courseChallengesData : []}
              columns={[
                { title: "Challenge", dataIndex: "challenge", key: "challenge" },
                { title: "Count", dataIndex: "count", key: "count" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>

        {/* Needs Tutor */}
        <Col span={8}>
          <Card title="Needs Tutor">
            <Table
              dataSource={needsTutorData.length ? needsTutorData : []}
              columns={[
                { title: "Need", dataIndex: "need", key: "need" },
                { title: "Count", dataIndex: "count", key: "count" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Emotional State */}
        <Col span={8}>
          <Card title="Emotional State">
            <Table
              dataSource={emotionalStateData.length ? emotionalStateData : []}
              columns={[
                { title: "State", dataIndex: "state", key: "state" },
                { title: "Count", dataIndex: "count", key: "count" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
