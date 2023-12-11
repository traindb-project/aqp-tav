import React from "react"
import Col from "antd/lib/col"
import Row from "antd/lib/row"
import Table from "antd/lib/table"

function ImportModelTable({ jsonData }) {
    const columns = [
        {
            title: "Key",
            dataIndex: "key",
            key: "key",
            width: 150,
            render: (text) => ({
                props: {
                    style: { backgroundColor: "#fafafa", fontWeight: "bold" },
                },
                children: text,
            }),
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
        },
    ]

    const targetData = Object.entries(jsonData.target).map(([key, value]) => ({
        key, value: key === "columnNames" ? value.join(",\n") : value,
    }))

    const modeltypeData = Object.entries(jsonData.modeltype).map(([key, value]) => ({
        key, value,
    }))

    const hyperparameterData = Object.entries(jsonData.hyperparameter).map(([key, value]) => ({
        key, value,
    }))

    const lineBreakOption = { whiteSpace: 'pre' }
    const tableScroll = { x: "100%" }

    return (
        <>
            <Row gutter={24}>
                <Col span={8}>
                    <h4>Target</h4>
                    <Table dataSource={targetData} columns={columns} pagination={false} showHeader={false} scroll={tableScroll} style={lineBreakOption} />
                </Col>
                <Col span={9}>
                    <h4>ModelType</h4>
                    <Table dataSource={modeltypeData} columns={columns} pagination={false} showHeader={false} scroll={tableScroll} style={lineBreakOption} />
                </Col>
                <Col span={7}>
                    <h4>Hyperparameter</h4>
                    <Table dataSource={hyperparameterData} columns={columns} pagination={false} showHeader={false} scroll={tableScroll} style={lineBreakOption} />
                </Col>
            </Row>
        </>
    )
}

export default ImportModelTable