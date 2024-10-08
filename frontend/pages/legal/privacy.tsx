import LegalComponent from "@/components/LegalComponent";
import { withProtected } from "@/hoc";
import { useAppSelector } from "@/store/types";

const PrivacyPolicy = () => {
  return <LegalComponent />;
};

export default withProtected(PrivacyPolicy);

export { getServerSideProps } from "@/components/LegalComponent";
