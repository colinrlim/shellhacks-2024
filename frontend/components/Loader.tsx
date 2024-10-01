// @/components/Loader

// Imports
import styles from "./css_modules/Loader.module.css";

// Loader component props
interface LoaderProps {
  show: boolean;
}

// * Loader
/**
 * Used to show a loading spinner
 */
const Loader = ({ show }: LoaderProps) => {
  return <span className={`${styles.loader} ${show ? "" : "hidden"}`}></span>;
};

export default Loader;
