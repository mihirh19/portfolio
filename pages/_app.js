import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import {AnimatePresence, motion} from "framer-motion";
import {useRouter} from "next/router";
import { Analytics } from '@vercel/analytics/react';
import Head from "next/head";
import dynamic from 'next/dynamic'

const AnimatedCursor = dynamic(() => import('react-animated-cursor'), {
    ssr: false
});

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
        <AnimatedCursor
        innerSize={8}
        outerSize={32}
        innerScale={0}
        outerScale={1.7}
        outerAlpha={0.2}
        showSystemCursor={true}
        outerStyle={{
            border: '2px solid',
            mixBlendMode: 'exclusion'

        }}
        trailingSpeed={4}
        innerStyle={{

            mixBlendMode: 'exclusion'

        }}

        />
        <div className="effect-3    " >
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
                    <Analytics />

                </motion.div>
            </AnimatePresence>
        </div>
    </ThemeProvider>
      </>
  );
}

export default MyApp;
