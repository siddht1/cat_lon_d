import Button from "@/components/Button";
import useCountDown from "@/hooks/useCountDown";
import http from "@/service/http";
import { Form, Input, message } from "antd";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

export interface LoginInfo {
    email: string;
    password: string;
    type?: "email";
}

export interface RegisterInfo extends LoginInfo {
    code: string;
}

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [countdown, startCount, stopCount] = useCountDown();
    const [form] = Form.useForm();
    const router = useRouter();

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const onFinish = async (info: RegisterInfo) => {
        setLoading(true);
        try {
            await http[isRegister ? "register" : "login"](info);
            message.success(isRegister ? "registration success" : "login successful" + "，Redirecting ...");
            router.push("/");
        } catch (error) {
            console.error(error);
        }
        stopCount();
        setLoading(false);
    };

    const sendEmail = async () => {
        const email = form.getFieldValue("email");
        if (!email?.trim()) {
            form.validateFields(["email"]);
            return;
        }

        setCodeLoading(true);
        try {
            await http.sendCode({ email });
            startCount();
        } catch (error) {
            console.error(error);
        }
        setCodeLoading(false);
    };

    useEffect(() => {
        const query = router.query;

        if (query.code) {
            form.setFieldsValue({ inviteCode: query.code });
            setIsRegister(true);
        }
    }, [form, router.query]);

    useEffect(() => {
        form.resetFields(["email", "password", "code"]);
    }, [form, isRegister]);

    return (
        <div className="flex h-full items-center justify-center">
            <Particles url="/particles.json" init={particlesInit} />
            <div
                className={classNames(
                    "w-[360px] max-w-md p-10 rounded-md z-10 bg-opacity-30 border-solid border border-gray-200",
                    "backdrop-filter backdrop-blur-sm"
                )}
            >
                {/* <h2 className="text-center text-3xl font-extrabold text-gray-900">Log in</h2> */}
                <Image
                    className="m-auto block bg-[#3050fb] p-3 rounded-xl"
                    width={64}
                    height={64}
                    src="/logo.svg"
                    alt="logo"
                />
                <Form form={form} className="mt-6" name="basic" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Email address is empty" },
                            { type: "email", message: "Email address format error" },
                        ]}
                    >
                        <Input placeholder="Please input the email address" className="rounded text-sm pt-2 pb-2" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        className={classNames(!isRegister && "mb-2")}
                        rules={[
                            { required: true, message: "Password is empty" },
                            {
                                min: 8,
                                pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])[A-Za-z0-9]+$/,
                                message: "Password should be more than 8 numbers and letters",
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="Please enter password"
                            className="rounded text-sm pt-2 pb-2"
                        />
                    </Form.Item>

                    {isRegister && (
                        <>
                            <Form.Item name="inviteCode">
                                <Input
                                    placeholder="Please enter the 6-digit invitation code, which can be empty"
                                    className="rounded text-sm pt-2 pb-2"
                                />
                            </Form.Item>
                            <div className="flex mb-4">
                                <Form.Item
                                    name="code"
                                    className="mb-0 mr-2 flex-1"
                                    rules={[{ required: true, message: "Password is empty" }]}
                                >
                                    <Input
                                        placeholder="E-mail verification code"
                                        className="rounded text-sm pt-2 pb-2"
                                    />
                                </Form.Item>
                                <Button
                                    className="h-[38px]"
                                    onClick={sendEmail}
                                    loading={codeLoading}
                                    disabled={!!countdown}
                                >
                                    {countdown ? `Resend（${countdown}Second）` : "Send the verification code"}
                                </Button>
                            </div>
                        </>
                    )}

                    <Form.Item className="mb-2">
                        <Button
                            className="p-0"
                            type="link"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? "Return to login" : "Register a new account"}
                        </Button>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            size="large"
                            className="w-full rounded"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {isRegister ? "register" : "log in"}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
