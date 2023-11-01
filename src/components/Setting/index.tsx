import { Modal, Tabs } from "antd";
import BasicInfo from "@/components/BasicInfo";
import useIsMobile from "@/hooks/useIsMobile";
import Billing from "@/components/Billing";

interface Props {
    open: boolean;
    notice?: string;
    onCancel: () => void;
}

const Setting: React.FC<Props> = ({ open, notice, onCancel }) => {
    const isMobile = useIsMobile();

    return (
        <Modal
            // title="set up"
            open={open}
            onCancel={onCancel}
            maskClosable={false}
            cancelText="Cancel"
            okText="keep"
            footer={null}
            width={800}
            bodyStyle={isMobile ? {} : { padding: "10px 20px 0 0" }}
        >
            {/* <Tabs destroyInactiveTabPane tabPosition={isMobile ? "top" : "left"}>
                <Tabs.TabPane tab="Basic Information" key="1">
                    <BasicInfo notice={notice} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Buy a package" key="2">
                    <Billing />
                </Tabs.TabPane>
            </Tabs> */}
            <BasicInfo notice={notice} />
        </Modal>
    );
};

export default Setting;
