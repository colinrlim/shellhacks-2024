import LegalComponent from "@/components/LegalComponent";
import { withProtected } from "@/hoc";

const TermsOfService = () => {
  return <LegalComponent />;
};

export default withProtected(TermsOfService);

export { getServerSideProps } from "@/components/LegalComponent";
