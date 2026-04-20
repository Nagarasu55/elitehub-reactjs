import { Button, Flex, Form, Image, Input, message, Typography } from "antd";
import styles from "./SignIn.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../service/axios";
import type { AxiosError } from "axios";
import { useState } from "react";
import logo from '../../assets/elitehub_logo.svg'

interface User {
    username: string;
    password: string;
}

interface ApiError {
    error: "USER_NOT_FOUND" | "INVALID_PASSWORD" | "Server error";
}


const SignIn = () => {
    const [form] = Form.useForm();
    const { Title } = Typography;
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false)

    const { setUser } = useAuthStore();


    const handleLogin = async (values: User): Promise<void> => {
        const { username, password } = values;
        setLoading(true);

        try {
            const response = await axiosInstance.post('/login', { username, password });
            setUser(response.data.user);
            navigate('/chatpage', { replace: true });

        } catch (error) {
            const err = error as AxiosError<ApiError>;
            const errorCode = err.response?.data?.error;

            if (errorCode === "USER_NOT_FOUND") {
                form.setFields([{
                    name: "username",
                    errors: ["User does not exist"]
                }]);
            }
            if (errorCode === "INVALID_PASSWORD") {
                form.setFields([{
                    name: "password",
                    errors: ["Incorrect password"]
                }]);
            }

        } finally {
            setLoading(false);
        }
    };

    return (

        <Flex
            className={styles.container}
            justify="center"
            align="center"
        >
            <Form
                form={form}
                layout="vertical"
                className={styles.form}
                onFinish={handleLogin}
                autoComplete="off"
            >
                <img src={logo} alt="EliteHub"  className={styles.logo} />

                <Title
                    level={2}
                    className={styles.formTitle}
                >
                    Log In
                </Title>
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Please enter username" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter password" }]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>Log In</Button>
                </Form.Item>


                <div className={styles.signUpLine}>
                    Don't have an account?
                    <span className={styles.signUpLink} onClick={() => navigate('/signup')}>Create one</span>
                </div>

            </Form>

        </Flex>

    )
}

export default SignIn;




