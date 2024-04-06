import React, { useState } from "react";
import { useRouter } from "next/router";
import { confirmForgotPassword } from "../util/user-util";
import { Button, Spin, Form, Input, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "@/styles/login.module.css";

export default function Handleforgotpassword() {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setLoading] = useState<boolean>(false);
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const handleNotificationClose = () => {
    router.push("/login");
  };

  interface formProperties {
    confirmationcode: string;
    password: string;
    username: string;
  }

  const handleSubmit = (values: formProperties): void => {
    setLoading(true);
    confirmForgotPassword(values.confirmationcode, values.password, values.username)
      .then(() => {
        setLoading(false);
        api.open({
          message: "Success!",
          description: "Congratulation! You actived your account already. Then will redirect you to the login page. ",
          duration: 0,
          style: {
            color: "blue",
          },
          placement: "topLeft",
          onClose: handleNotificationClose,
        });
      })
      .catch(() => {
        setLoading(false);
        api.open({
          message: "Error",
          description: "Plese check if your confirmationcode or username is correct. ",
          duration: 0,
          style: {
            color: "red",
          },
          placement: "topLeft",
        });
      });
  };

  return (
    <div>
      <div className={styles.app}>
        <div className={styles.title}>Handle Forget Password</div>
        <div>
          {contextHolder}
          <Form name="basic" labelCol={{ span: 10 }} initialValues={{ remember: true }} onFinish={handleSubmit} autoComplete="off">
            <Form.Item
              label="Your User Name"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username (may be same as your Email)!",
                },
              ]}
            >
              <Input className={styles.inputBox} />
            </Form.Item>

            <Form.Item
              label="Confirmation Code"
              name="confirmationcode"
              rules={[
                {
                  required: true,
                  message: "Please input your Confirmation Code!",
                },
              ]}
            >
              <Input className={styles.inputBox} />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password className={styles.inputBox} />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <div className={styles.bottomLink}>
                {" "}
                <div>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </div>
                <div>
                  {isLoading ? (
                    <div>
                      {" "}
                      <div>
                        &emsp;&emsp;&emsp;&emsp;
                        <Spin indicator={antIcon}>
                          <div className="content" />
                        </Spin>
                      </div>
                    </div>
                  ) : (
                    <div>&emsp;</div>
                  )}
                </div>
              </div>
            </Form.Item>
          </Form>
        </div>
        <div>
          Your Confirmation Code is in the Email which sent you after your password was reset by administrator.
          <br></br> The Confirmation Code is the &quot;temporary password&quot; in the Email.
          <br></br>After you input all right info, this page will redirect you to the login page.
        </div>
      </div>
    </div>
  );
}
