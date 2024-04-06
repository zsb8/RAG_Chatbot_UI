import React, { useState } from "react";
import { useRouter } from "next/router";
import { signUpConfirm } from "../util/user-util";
import { Button, Spin, Form, Input, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "@/styles/login.module.css";

export default function Activateaccount() {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setLoading] = useState<boolean>(false);
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const handleNotificationClose = () => {
    router.push("/login");
  };

  const handleSubmit = (values: any): void => {
    setLoading(true);
    signUpConfirm(values.email, values.code)
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
          description: "Active failed. Plese check your temproary password. ",
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
        <div className={styles.title}>Active Your Account</div>
        <div>
          {" "}
          {contextHolder}
          <Form name="basic" labelCol={{ span: 6 }} initialValues={{ remember: true }} onFinish={handleSubmit} autoComplete="off">
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please input your email!" }]}>
              <Input className={styles.inputBox} />
            </Form.Item>

            <Form.Item
              label="Code"
              name="code"
              rules={[
                {
                  required: true,
                  message: "Please input your confirmation code!",
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
          Please input your code (temporary password which emailed you already) in this form. <br></br>
          After active your account, we will redirect you to the login page.
        </div>
      </div>
    </div>
  );
}
