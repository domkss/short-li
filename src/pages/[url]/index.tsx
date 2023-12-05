import { RedisDB } from "../../lib/redisDB";
import type { GetServerSidePropsContext } from "next";

type ErrorProps = {
  message: string;
};

export default function RedirectPage(props: ErrorProps) {
  return <main className='flex justify-center py-4'>{props.message}</main>;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  var destionationURL: string | null = ctx.resolvedUrl;

  try {
    if (destionationURL) {
      destionationURL = destionationURL.substring(1);
      const redisClient = await RedisDB.getClient();
      if (!(redisClient && redisClient.isOpen))
        return { props: { message: "Failed to conncet to redirection dataabse. Please try again later." } };
      destionationURL = await redisClient.GET(destionationURL);
    }
  } catch (e) {
    return { props: { message: "Redirection failed. Internal server error" } };
  }

  return {
    redirect: {
      destination: destionationURL ? destionationURL : "/",
      permanent: true,
    },
  };
}
