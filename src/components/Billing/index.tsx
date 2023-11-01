import { Alert, message } from "antd";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import http from "@/service/http";
import QRCode from "qrcode";
import classNames from "classnames";
import {
    AlipayCircleOutlined,
    ArrowDownOutlined,
    CheckCircleOutlined,
    FireFilled,
    LeftOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Scrollbar from "@/components/Scrollbar";
import useIsMobile from "@/hooks/useIsMobile";

export interface ChargeType {
    name: string;
    price: number;
    count: number;
    hot?: boolean;
    type: OrderParams["productType"];
    descs: string[];
}

export interface OrderParams {
    payType: "stripe";
    productType: 1 | 2 | 3;
}

export interface OrderResult {
    orderId: number;
    qrCode: string;
}

export enum OrderStatus {
    NULL = 0,
    toPay = 1,
    payed = 2,
    cancelled = 3,
}

const PayTip = {
    [OrderStatus.NULL]: "",
    [OrderStatus.toPay]: "It is detected that you have not scanned the QR code, please complete the payment as soon as possible",
    [OrderStatus.cancelled]: "Checked that you have canceled the payment, please scan the code again",
};

const BasicInfo: React.FC = () => {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [qrcode, setQrcode] = useState("");
    const [orderStatus, setOrderStatus] = useState<OrderStatus>(0);
    const [orderInfo, setOrderInfo] = useState<OrderResult | null>(null);
    const charges: ChargeType[] = [
        {
            name: "Basic version",
            price: 10,
            type: 1,
            count: 100,
            descs: ["Text mode supports up to 4000 tokens", "Priority to experience new features"],
        },
        {
            name: "Premium version",
            price: 30,
            type: 2,
            hot: true,
            count: 500,
            descs: ["Text mode supports up to 4000 tokens", "Priority to experience new features"],
        },
        {
            name: "Exclusive edition",
            price: 100,
            type: 3,
            count: 2000,
            descs: ["Text mode supports up to 4000 tokens", "Priority to experience new features"],
        },
    ];
    const Wrapper = isMobile ? Scrollbar : "div";

    const onBuy = async (charge: ChargeType) => {
        setLoading(true);
        setOrderStatus(0);
        try {
            const data = await http.createOrder({ payType: "stripe", productType: charge.type });
            setOrderInfo(data);
        } catch (error: any) {
            console.error(error);
        }
        setLoading(false);
    };

    const genQRCode = async (orderInfo: OrderResult) => {
        const data = await QRCode.toDataURL(orderInfo.qrCode);
        setQrcode(data);
    };

    const onCheckPay = async () => {
        setStatusLoading(true);
        try {
            const data = await http.checkOrder(orderInfo!.orderId);
            setOrderStatus(data);

            if (data === OrderStatus.payed) {
                message.success("You have paid successfully and your current points have been updated");
            }
        } catch (error) {
            console.error(error);
        }
        setStatusLoading(false);
    };

    useEffect(() => {
        if (orderInfo) {
            genQRCode(orderInfo);
        }
    }, [orderInfo]);

    if (orderInfo && orderStatus !== OrderStatus.payed) {
        return (
            <div className="min-h-[400px]">
                <Button
                    className={isMobile ? "pl-0" : ""}
                    type="link"
                    onClick={() => setOrderInfo(null)}
                >
                    <LeftOutlined />
                   Reselect plan
                </Button>
                <div className="">
                    <div className="flex justify-center align-middle my-4">
                        Currently supports QR code scanning method：
                        <AlipayCircleOutlined className="text-blue-500 text-2xl" />
                    </div>
                    <div className="flex justify-center">
                        {qrcode && (
                            <Image
                                className=" border border-gray-200 border-solid"
                                width="200"
                                height="200"
                                src={qrcode}
                                alt="Pay QR code"
                            />
                        )}
                    </div>
                    <div className="text-center mt-2 text-red-500">{PayTip[orderStatus]}</div>
                    <Button
                        loading={statusLoading}
                        onClick={onCheckPay}
                        className="block mt-4 mx-auto"
                    >
                       I have paid
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Alert
                className="bg-transparent"
                banner
                message={<div>The normal text of the current conversation consumes 1 point, and the picture mode consumes 8 points.</div>}
            />

            <div className={classNames("mt-4 mb-8", isMobile && "h-[20rem]")}>
                <Wrapper className={classNames(!isMobile && "flex mt-8")}>
                    {charges.map((charge, index) => (
                        <div
                            key={charge.name}
                            className={classNames(
                                "border border-solid border-gray-200 rounded-md p-5 w-full h-fit",
                                charge.hot && !isMobile && "shadow-xl scale-110 mx-8",
                                isMobile && charge.hot && "my-8",
                                index === charges.length - 1 && isMobile && "mb-4"
                            )}
                        >
                            <div className="text-xl text-center mb-3">
                                {charge.hot && <FireFilled className="text-red-500 mr-2" />}
                                {charge.name}
                            </div>
                            <div
                                className={classNames(
                                    "text-center text-gray-500 border-0 border-b border-solid",
                                    "border-gray-200 py-2"
                                )}
                            >
                                <CheckCircleOutlined className="text-green-500 mr-1" />
                               <span className="font-bold"> {charge.count} </span>Integral
                            </div>
                            {charge.descs.map((desc) => (
                                <div
                                    className={classNames(
                                        "text-center text-gray-500 border-0 border-b border-solid",
                                        "border-gray-200 py-2"
                                    )}
                                    key={desc}
                                >
                                    <CheckCircleOutlined className="text-green-500 mr-1" />
                                    {desc}
                                </div>
                            ))}
                            <div className="my-4 text-red-500 text-center">
                                 ₹<span className="font-bold text-2xl">{charge.price}</span>
                            </div>
                            <Button
                                className="w-full rounded"
                                type="primary"
                                loading={loading}
                                onClick={() => onBuy(charge)}
                            >
                                Buy it now
                            </Button>
                        </div>
                    ))}
                </Wrapper>
                {isMobile && (
                    <p className="text-gray-500 text-center">
                        <ArrowDownOutlined className="animate-bounce mr-1" />
                        Scroll down to see more packages
                    </p>
                )}
            </div>
        </>
    );
};

export default BasicInfo;
