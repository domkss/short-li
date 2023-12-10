import type { GetServerSidePropsContext } from "next";

type ErrorProps = {
  message: string;
};

export default function RedirectPage(props: ErrorProps) {
  return <main className='flex justify-center py-4'>{props.message}</main>;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let shortURL: string | null = ctx.resolvedUrl;
  let destinationURL: string = "/";

  if (shortURL) {
    shortURL = shortURL.substring(1);

    let apiResponse = await fetch(
      "http://localhost:" + process.env.SERVER_PORT + "/api/redirect-url?inputurl=" + shortURL
    );
    if (apiResponse.status === 200) {
      let responseBody = await apiResponse.json();
      destinationURL = responseBody.message;
    } else {
      return { props: { message: "Redirection failed. Internal server error" } };
    }
  }

  return {
    redirect: {
      destination: destinationURL,
      permanent: true,
    },
  };
}
