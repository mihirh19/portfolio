import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import {AnimatePresence, motion} from "framer-motion";
import {useRouter} from "next/router";
import Head from "next/head";
const variants = {
    scaleDown: {
        scale: 0.8,
        y: 100,
        transition: {
            duration: 0.2
        }
    },
    out: {
        x: "-100%",
        transition: {
            duration: 0.2,
            delay: 0.2
        }
    },
    in: {
        scale: 0.8,
        y: 100,
        x: "100%",
        transition: {
            duration: 0.2
        }
    },
    center: {
        x: 0,
        scale: 0.8,
        transformOrigin: 'top',
        transition: {
            duration: 0.3
        }
    },
    scaleUp: {
        scale: 1,
        y: 0,
        transition: {
            duration: 0.3,
            delay: 0.2
        }
    },
};
function MyApp({ Component, pageProps }) {
    const { asPath } = useRouter();
  return (
      <>
          <Head>
              <title>Mihir Hadavani</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
          </Head>
    <ThemeProvider defaultTheme="dark" attribute="class">
        <div className="effect-3">
            <AnimatePresence
                initial={false}
                mode={'wait'}
            >
                <motion.div
                    key={asPath}
                    variants={variants}
                    initial="in"
                    animate={["center", "scaleUp"]}
                    exit={["scaleDown", "out"]}


                >
      <Component {...pageProps} />
                </motion.div>
            </AnimatePresence>
        </div>
    </ThemeProvider>
      </>
  );
}

export default MyApp;
