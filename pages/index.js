
import ContainerBlock from "../components/ContainerBlock";
import FavouriteProjects from "../components/FavouriteProjects";
import LatestCode from "../components/LatestCode";
import Hero from "../components/Hero";
import getLatestRepos from "@lib/getLatestRepos";
import userData from "@constants/data";




export default function Home({ repositories }) {
  return (
    <ContainerBlock
      title="Mihir Hadavani"
      description="This is a template built specifically for my blog - Creating a developer portfolio that gets you a job."
    >

      <Hero />
      <FavouriteProjects />

      <LatestCode repositories={repositories} />

    </ContainerBlock>

  );
}

export const getServerSideProps = async () => {
  let token = process.env.GITHUB_AUTH_TOKEN;

  const repositories = await getLatestRepos(userData, token);
  // console.log("REPOSITORIES", repositories);

  return {
    props: {
      repositories,
    },
  };
};
