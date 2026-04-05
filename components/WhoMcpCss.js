import Head from 'next/head';
import Link from 'next/link';
import { useLayoutEffect } from 'react';

export default function WhoMcpCss() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('flowrium-home', 'hero-revealed', 'flowrium-home-route');
    document.documentElement.classList.add('page-who-mcp-root');
    return () => {
      document.documentElement.classList.remove('page-who-mcp-root');
    };
  }, []);

  return (
    <>
      <Head>
        <title>&gt;Who — flowrium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-who-mcp">
        <Link className="page-who-mcp__back page-who-mcp__back--solo" href="/">
          {'< Home'}
        </Link>
        <div className="page-who-mcp__scroll">
          <div className="who-mcp" data-node-id="848:1243">
            <div className="who-mcp__top-gradient" aria-hidden />

            <section className="who-mcp__top">
              <div className="who-mcp__profile">
                <p className="who-mcp__role-en">Developer &amp; Desinger</p>
                <p className="who-mcp__role-ko">개발 디자이너</p>
                <h1 className="who-mcp__name">조수연</h1>
                <p className="who-mcp__years">2023-2026</p>
                <div className="who-mcp__edu">
                  <p>한국예술종합학교 학사</p>
                  <p>CCID 디자인랩 연구원</p>
                </div>
              </div>

              <div className="who-mcp__cols">
                <div className="who-mcp__col">
                  <h2 className="who-mcp__col-title">works</h2>
                  <div className="who-mcp__timeline">
                    <span className="who-mcp__dot who-mcp__dot--top" aria-hidden />
                    <span className="who-mcp__dot who-mcp__dot--bottom" aria-hidden />
                    <span className="who-mcp__line" aria-hidden />
                    <ul className="who-mcp__list">
                      <li>
                        <b>25.07</b> HYUNDAI 산학
                        <br />
                        UX / UI(버튼 모듈) / UT 참여
                      </li>
                      <li>
                        <b>25.07</b> Coex × NAVER Cloud Agent 산학
                        <br />
                        UI / LLM / <b>Agent WebGL 담당</b>
                      </li>
                      <li>
                        <b>25.08</b> 국가 프로젝트(산자부) 산학 연구활동
                        <br />
                        User Research / UT / UX 참여
                        <br />
                        <b>‘디자이너 워크플로우 AI 생성 파이프라인 개발’</b>
                      </li>
                      <li>
                        <b>25.09</b> 부산 BEXCO ‘CO-SHOW’ 작품 전시
                        <br />
                        PM / BX / UX / UI / Tech 리더
                        <br />
                        <b>‘일상의 휴식을 발견하는 생성형 AI 경험’</b>
                      </li>
                      <li>
                        <b>25.09</b> LG Electronics × K-Arts Campus Art Collaboration
                        <br />
                        ‘공감지능 에이전트 프로젝트’
                        <br />
                        PM / UX / UI / BX / Tech 리더
                      </li>
                      <li>
                        <b>25.12</b> 단국대 융합 3D 미디어 산학
                        <br />
                        ‘만파식적: 명상용 App 제작 프로젝트’
                        <br />
                        BX / UX / Tech 담당
                      </li>
                      <li>
                        <b>26.03</b> Platform-L 무라카미 하루키전_프로젝트 진행중
                        <br />
                        UI 담당 / BX / Tech 리더
                        <br />
                        ‘관람객, 미디어 월과 인터랙션하는 web 제작’
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="who-mcp__col">
                  <h2 className="who-mcp__col-title">another</h2>
                  <div className="who-mcp__timeline">
                    <span className="who-mcp__dot who-mcp__dot--top" aria-hidden />
                    <span className="who-mcp__dot who-mcp__dot--bottom" aria-hidden />
                    <span className="who-mcp__line" aria-hidden />
                    <ul className="who-mcp__list">
                      <li>
                        <b>23.07</b> 24초 영화제 수상_산림청
                        <br />
                        <b>‘나의 쉼이란’</b>
                      </li>
                      <li>
                        <b>24.12</b> 워커힐 빛의 시어터 영상 송출
                        <br />
                        리더 / 소스제작 / 편집 / 브랜딩 리더
                        <br />
                        <b>‘이니스프리 브랜딩 미디어 아트 프로젝트’</b>
                      </li>
                      <li>
                        <b>25.05</b> 마루아트센터 media art 전시
                        <br />
                        <b>‘화면속 캐릭터의 자아를 바꾸는 ai 프로젝트’</b>
                      </li>
                      <li>
                        <b>25.07</b> 성남시 문화재단 ART TECH for L.I.F.E <b>대상</b> 수상
                        <br />
                        리더 / 기획 브랜딩 / 디자인 / Front, Api developer
                        <br />
                        <b>‘어린이 기억 기반으로 그림책을 생성 AI 프로젝트’</b>
                      </li>
                      <li>
                        <b>26.02</b> CIC 컨퍼런스 발표
                        <br />
                        ‘LG Electronics x 집안을 오케스트레이션 하는 AI’
                      </li>
                      <li>
                        <b>25.08</b> SWNA 디자이너 대상 AI 워크플로우 워크숍
                        <br />
                        사회자 및 진행 / 분석 / 기획
                      </li>
                      <li>
                        <b>25.09</b> 현대 무용 ‘꼭대기 안쪽_유해린’ 무대 감독
                        <br />
                        ‘반응형 프로젝션 맵핑 무대 제작’
                        <br />
                        영상 / <b>Tech 리더</b>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="who-mcp__col who-mcp__col--skills">
                  <h2 className="who-mcp__col-title">skills</h2>
                  <div className="who-mcp__skills-grid">
                    <div className="who-mcp__skill">
                      <p className="who-mcp__skill-title">2D</p>
                      <p className="who-mcp__skill-items">
                        <b>Figma</b>
                        <br />
                        Adobe Illustrator
                        <br />
                        Adobe Photoshop
                      </p>
                    </div>
                    <div className="who-mcp__skill">
                      <p className="who-mcp__skill-title">vid</p>
                      <p className="who-mcp__skill-items">
                        <b>TouchDesigner</b>
                        <br />
                        After Effects
                      </p>
                    </div>
                    <div className="who-mcp__skill">
                      <p className="who-mcp__skill-title">3D</p>
                      <p className="who-mcp__skill-items">
                        <b>Fusion 360</b>
                        <br />
                        Maya
                        <br />
                        Shapr3D
                        <br />
                        KeyShot
                        <br />
                        Blender
                        <br />
                        Onshape
                      </p>
                    </div>
                    <div className="who-mcp__skill">
                      <p className="who-mcp__skill-title">AI &amp; tech</p>
                      <p className="who-mcp__skill-items">
                        <b>Cursor</b>
                        <br />
                        Kling
                        <br />
                        Midjourney
                        <br />
                        visual studio code
                        <br />
                        Nano Banana
                        <br />
                        Higgsfield
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="who-mcp__pills">
                {[
                  'Cursor AI',
                  'WebGL',
                  'Next.js',
                  'React',
                  'ThreeJS',
                  'Figma MCP',
                  'Yarn',
                  'Antigravity',
                  'Codepen',
                  'Spring',
                  'CSS',
                  'JS',
                ].map((t) => (
                  <span key={t} className="who-mcp__pill">
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className="who-mcp__bottom">
              <img
                className="who-mcp__rock"
                src="/figma/who/rock.png"
                alt=""
                aria-hidden
                draggable={false}
              />
              <div className="who-mcp__bottom-wash" aria-hidden />
              <p className="who-mcp__statement">
                코드로 경험을 입체적으로 확장하는,
                <br />
                웹사이트 속 질감을 만드는,
                <br />
                AI &amp; 컴퓨테이션 디자인에 자신있는 디자이너 입니다
              </p>
              <div className="who-mcp__cards">
                <div className="who-mcp__card">
                  <p className="who-mcp__card-num">01</p>
                  <p className="who-mcp__card-title">작업 방식</p>
                  <img className="who-mcp__card-line" src="/figma/who/line2.png" alt="" aria-hidden />
                  <p className="who-mcp__card-body">
                    저는 Figma로 디자인한 인터랙션이 실제로 구현 가능한지
                    <br />
                    바로 검증하는 방식으로 작업하고 있습니다.
                  </p>
                </div>
                <div className="who-mcp__card">
                  <p className="who-mcp__card-num">02</p>
                  <p className="who-mcp__card-title">비주얼라이제이션 기반 기술 디자인 경험</p>
                  <img className="who-mcp__card-line" src="/figma/who/line2.png" alt="" aria-hidden />
                  <p className="who-mcp__card-body">
                    저는 단순히 기능을 구현하는 것이 아니라,
                    <br />
                    비주얼과 움직임을 통해 경험을 설계하는 디자이너입니다.
                  </p>
                </div>
                <div className="who-mcp__card">
                  <p className="who-mcp__card-num">03</p>
                  <p className="who-mcp__card-title">협업_파이프라인 설계 경험</p>
                  <img className="who-mcp__card-line" src="/figma/who/line2.png" alt="" aria-hidden />
                  <p className="who-mcp__card-body">
                    저는 Figma로 디자인한 인터랙션이 실제로 구현 가능한지
                    <br />
                    바로 검증하는 방식으로 작업하고 있습니다.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

