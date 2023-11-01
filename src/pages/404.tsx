import { Result } from "antd";

export default function Page404() {
    return (
        <div className="flex items-center justify-center h-full">
            <Result status="404" title="404" subTitle="Sorry, the page you are currently visiting does not exist" />
        </div>
    );
}
