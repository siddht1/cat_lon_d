import { Alert, Col, Input, message, Popconfirm, Row } from "antd";
import { useContext, useEffect, useState } from "react";
import Button from "@/components/Button";
import { UserStore } from "@/store/User";
import copyToClipboard from "@/utils/copyToClipboard";
import http from "@/service/http";
import { useRouter } from "next/router";
import useIsMobile from "@/hooks/useIsMobile";

interface Props {
    notice?: string;
}

const BasicInfo: React.FC<Props> = ({ notice }) => {
    const { userInfo, refreshUserInfo } = useContext(UserStore);
    const router = useRouter();
    const isMobile = useIsMobile();
    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [rechargeCode, setChargeCode] = useState("");
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const leftSpan = isMobile ? 8 : 6;

    useEffect(() => {
        refreshUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCopyInviteUrl = async () => {
        const url = location.origin + "/login?code=" + userInfo.inviteCode;
        try {
            await copyToClipboard(url);
            message.success("Copied successfully");
        } catch (error) {
            message.error("Copy failed");
        }
    };

    const onLogout = async () => {
        await http.logout();
        router.replace("/login");
    };

    const onReCharge = async () => {
        setRechargeLoading(true);
        try {
            await http.recharget({ key: rechargeCode });
            await refreshUserInfo();
            setRechargeOpen(false);
        } catch (error) {
            console.error(error);
        }
        setRechargeLoading(false);
    };

    return (
        <div>
            {notice && (
                <Alert
                    className="mb-4"
                    description={<div dangerouslySetInnerHTML={{ __html: notice }} />}
                    type="success"
                    closable
                />
            )}
            <Row align="middle" gutter={[16, 16]}>
                <Col span={leftSpan}>
                    <label>email address：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.email}</span>
                </Col>
                <Col span={leftSpan}>
                    <label>Invitation code：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.inviteCode}</span>
                    <Button type="link" onClick={onCopyInviteUrl}>
                        Copy invitation link
                    </Button>
                </Col>
                <Col span={leftSpan}>
                    <label>remaining points：</label>
                </Col>
                <Col span={24 - leftSpan}>
                    <span>{userInfo.integral}</span>
                    <Popconfirm
                        icon={null}
                        title={
                            <Input
                                value={rechargeCode}
                                placeholder="Please enter the recharge key"
                                onChange={(e) => setChargeCode(e.target.value)}
                            />
                        }
                        open={rechargeOpen}
                        cancelText="Cancel"
                        okText="confirm"
                        onConfirm={onReCharge}
                        onCancel={() => setRechargeOpen(false)}
                        okButtonProps={{ loading: rechargeLoading }}
                    >
                        <Button type="link" onClick={() => setRechargeOpen(!rechargeOpen)}>
                           increase points
                        </Button>
                    </Popconfirm>
                </Col>
                <Col span={24} className="flex justify-center">
                    <Button onClick={onLogout}>sign out</Button>
                </Col>
            </Row>
        </div>
    );
};

export default BasicInfo;
