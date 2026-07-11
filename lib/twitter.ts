export interface XProfile {
  username: string;
  displayName: string;
  bio: string;
  posts: string[];
}

interface XUser {
  id: string;
  name: string;
  username: string;
  description?: string;
}

interface XTweet {
  id: string;
  text: string;
}

export async function fetchXProfile(username: string): Promise<XProfile> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is not set");

  const headers = { Authorization: `Bearer ${token}` };

  const userRes = await fetch(
    `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=name,description`,
    { headers }
  );

  if (!userRes.ok) {
    const body = await userRes.json().catch(() => ({}));
    throw new Error(
      (body as { detail?: string }).detail ??
        `X API error ${userRes.status}: ユーザーが見つかりませんでした。`
    );
  }

  const userData = (await userRes.json()) as { data: XUser };
  const user = userData.data;

  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${user.id}/tweets?max_results=20&tweet.fields=text&exclude=retweets,replies`,
    { headers }
  );

  let posts: string[] = [];
  if (tweetsRes.ok) {
    const tweetsData = (await tweetsRes.json()) as { data?: XTweet[] };
    posts = (tweetsData.data ?? []).map((t) => t.text);
  } else {
    console.warn(`X tweets fetch failed: ${tweetsRes.status} for @${username}`);
  }

  // ツイートが取得できなかった場合はbioをフォールバックとして使用
  const bio = user.description ?? "";
  if (posts.length === 0 && bio) {
    posts = [bio];
  }

  return {
    username: user.username,
    displayName: user.name,
    bio,
    posts,
  };
}
