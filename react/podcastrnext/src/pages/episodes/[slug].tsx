import { GetStaticPaths, GetStaticProps } from 'next';

import { useRouter } from 'next/router';
import { api } from '../../services/api';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationTimeString } from '../../utils/convertDurantionToTimeString';

import styles from './episode.module.scss';

import Image from 'next/image';

import Link from 'next/link';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    duration: string;
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

    return (
        <div className={styles.episode}>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                />

                <button type="button">
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>

                <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />

            </header>
        </div>
    )
}

//necessario para gerar as paginas de forma estatica
export const getStaticPaths: GetStaticPaths = async () => {

    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        //paths: [],
        paths,
        fallback: 'blocking'
        //se for false, ele retorna 404 o que não for estatico, ele só abre a pagina do que for passado no paths: [].
        //se for true ele renderiza pelo browser
        //se for blocking ele vai gerando a pagina estatica conforme vai sendo acessada
        //ou seja, se for true ou blocking - incremental static regeneration
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {

    const { slug } = ctx.params;

    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    };

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, // 24h
    }
}