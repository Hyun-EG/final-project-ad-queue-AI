import AdInfoTable from '../../components/AdInfoTable';
import arrowLeft from '../../assets/arrow-left.svg';
import ReviewAdNumber from '../../components/ReviewAdNumber';
import ReviewAdResult from '../../components/ReviewAdResult';
import Button from '../../components/Common/Button';
import IssuedReason from '../../components/IssuedReason';
import arrowDown from '../../assets/arrow-down.svg';
import arrowUp from '../../assets/arrow-up.svg';
import iconPlus from '../../assets/icon-plus.svg';
import { useEffect, useState } from 'react';
import Modal from '../../components/Common/Modal';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchLoadIssueOption } from '../../api/issueAd/issueAdApi';

type IssuedReasonType = {
  contentNumber: number;
  articleNumber: number;
  articleTitle: string;
  articleContent: string;
  issuedReason: string;
};

type AdDetailsType = {
  provisionArticle: number;
  provisionContent: string;
  sentence: string;
  opinion: string;
};

type IssueOptionType = {
  id: number;
  article: number;
  content: string;
};

const IssueAdResult = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActiveSelectReason, setIsActiveSelectReason] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issuedReasons, setIssuedReasons] = useState<IssuedReasonType[]>([]);
  const [reason, setReason] = useState<IssueOptionType[]>([]);

  // 새로운 검토 의견 추가 관리
  const [newReason, setNewReason] = useState({
    contentNumber: issuedReasons.length + 1,
    articleNumber: 0,
    articleTitle: '',
    articleContent: '',
    issuedReason: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 지적광고 목록 페이지에서 요청한 데이터 응답
  const adDetails = location.state?.adDetails;

  useEffect(() => {
    if (adDetails && adDetails.reviewList) {
      setIssuedReasons(
        adDetails.reviewList.map((review: AdDetailsType, index: number) => ({
          contentNumber: index + 1,
          articleNumber: review.provisionArticle,
          articleTitle: review.provisionContent,
          articleContent: review.sentence,
          issuedReason: review.opinion,
        })),
      );
    }

    fetchLoadIssueOption()
      .then((response) => {
        setReason(response.data.data.provisionList);
        console.log('조항리스트', response);
      })
      .catch((error) => {
        console.error('조항 리스트 조회 실패', error);
      });
  }, [adDetails]);

  useEffect(() => {
    console.log('reason', reason);
  }, [reason]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleActiveSelectReason = () => {
    setIsActiveSelectReason(!isActiveSelectReason);
  };

  const [selectedIndex, setSelectedIndex] = useState<{ reason: number | null }>({ reason: null });

  // 조항 선택
  const handleSelected = (type: 'reason', index: number) => {
    setSelectedIndex((prevState) => ({
      ...prevState,
      [type]: index,
    }));

    const selectedArticle = reason[index].article;
    const selectedContent = reason[index].content;

    setNewReason((prev) => ({
      ...prev,
      articleNumber: selectedArticle,
      articleTitle: selectedContent,
    }));
  };

  // 검수 결과 이유 펼치기 전 말줄임표
  const getShortArticleContent = (reason: string) => {
    if (reason.length > 12) {
      return `${reason.substring(0, 12)}...`;
    }
    return reason;
  };

  // 조항 드롭다운
  const renderDropdownList = () => {
    return reason.map((item, index) => (
      <div
        key={item.article}
        className={`IssueAdResult__selectReason_reason ${
          selectedIndex.reason === index ? 'selected' : ''
        } ${selectedIndex.reason === index + 1 ? 'previous-selected' : ''}`}
        onClick={() => handleSelected('reason', index)}>
        {`${item.article}조 ${getShortArticleContent(item.content)} `}
      </div>
    ));
  };

  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  // 새로운 검수 의견 추가
  const addNewReason = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setNewReason((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clickAddIssuedReasonBtn = () => {
    setIssuedReasons((prevReasons) => [
      ...prevReasons,
      {
        ...newReason,
        articleNumber: parseInt(newReason.articleNumber.toString(), 10),
      },
    ]);

    setNewReason({
      contentNumber: issuedReasons.length + 2,
      articleNumber: 0,
      articleTitle: '',
      articleContent: '',
      issuedReason: '',
    });
  };

  return (
    <main className="IssueAdResult">
      <article className="IssueAdResult__wrapperLeft">
        <button className="IssueAdResult__wrapperLeft_arrow" onClick={goBack}>
          <img src={arrowLeft} alt="뒤로가기 화살표" />
        </button>
        <div className="IssueAdResult__wrapperLeft_contents">
          <ReviewAdNumber adNumber={adDetails?.id} />
          <AdInfoTable title1="상품명" title2="광고주" content1={adDetails?.product} content2={adDetails?.advertiser} />
          <AdInfoTable
            title1="업종구분"
            title2="게재일"
            content1={adDetails?.category}
            content2={adDetails?.postDate}
          />
          <AdInfoTable
            title1="담당자"
            title2="최종수정자"
            content1={adDetails?.assigneeName}
            content2={adDetails?.modifierName}
          />
          <div className="IssueAdResult__wrapperLeft_contents_article">{adDetails?.content}</div>
        </div>
      </article>
      <div className="middleBar"> </div>
      <article className="IssueAdResult__wrapperRight">
        <div className="IssueAdResult__wrapperRight_contents">
          <div className="IssueAdResult__wrapperRight_contents_title">
            <ReviewAdResult reviewNumber={3} detailSpan="광고 수정 판정을 받은 광고입니다." />
            <div className="IssueAdResult__wrapperRight_contents_title_buttons">
              <Button type="button" state="default_white" width="5.417vw" height="4.815vh" fontSize="0.781vw">
                임시 저장
              </Button>
              <Button
                type="button"
                state="default"
                width="5.417vw"
                height="4.815vh"
                fontSize="0.781vw"
                onClick={handleModalOpen}>
                다음
              </Button>
            </div>
          </div>
          <div className="IssueAdResult__wrapperRight_contents_resultBox">
            {issuedReasons.length === 0 ? (
              <div className="IssueAdResult__wrapperRight_contents_resultBox_empty">위반 사항이 없습니다.</div>
            ) : (
              issuedReasons.map((reason, index) => (
                <IssuedReason
                  key={index}
                  contentNumber={reason.contentNumber}
                  articleNumber={reason.articleNumber}
                  articleTitle={reason.articleTitle}
                  articleContent={reason.articleContent}
                  issuedReason={reason.issuedReason}
                />
              ))
            )}

            {isOpen ? (
              <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult">
                <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar">
                  <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title">
                    <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title_number">
                      #1
                    </div>
                    <div
                      className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title_articleNum"
                      onClick={handleActiveSelectReason}>
                      {isActiveSelectReason && (
                        <div className="IssueAdResult__selectReason">{renderDropdownList()}</div>
                      )}

                      <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title_articleNum-span">
                        {newReason.articleNumber ? `제 ${newReason.articleNumber}조` : '조항 선택'}
                      </div>
                      <img src={arrowDown} alt="아래 화살표" />
                    </div>

                    <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title_articleTitle">
                      {newReason.articleTitle || '선택한 조항이 표시됩니다'}
                    </div>
                  </div>
                  <div
                    className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_icon"
                    onClick={handleToggle}>
                    <img src={arrowUp} alt="화살표" />
                  </div>
                </div>
                <input
                  name="articleContent"
                  value={newReason.articleContent}
                  onChange={addNewReason}
                  type="text"
                  className="IssueAdResult__wrapperRight_contents_resultBox_addResult_selectInput"
                  placeholder="지적 문장을 선택해주세요."
                />
                <textarea
                  name="issuedReason"
                  value={newReason.issuedReason}
                  onChange={addNewReason}
                  className="IssueAdResult__wrapperRight_contents_resultBox_addResult_writeInput"
                  placeholder="검토 의견을 작성해주세요."
                />
                <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_button">
                  <Button
                    type="button"
                    state="default"
                    width="5.417vw"
                    height="4.815vh"
                    fontSize="0.781vw"
                    onClick={clickAddIssuedReasonBtn}>
                    추가
                  </Button>
                </div>
              </div>
            ) : (
              <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult-close">
                <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar-close">
                  <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title">
                    <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar_title_number">
                      #1
                    </div>
                    <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar-close_title_articleNum">
                      <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar-close_title_articleNum-span">
                        조항 선택
                      </div>
                    </div>
                    <div className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar-close_title_articleTitle">
                      위반 내용을 작성해주세요.
                    </div>
                  </div>
                  <div
                    className="IssueAdResult__wrapperRight_contents_resultBox_addResult_toggleBar-close_icon"
                    onClick={handleToggle}>
                    <img src={iconPlus} alt="플러스 아이콘" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className="IssueAdResult__modal">
          <Modal
            mode="decisionType"
            btnContentOne="취소"
            btnContentTwo="확인"
            onClickOne={() => {
              setIsModalOpen(false);
            }}
          />
        </div>
      )}
    </main>
  );
};

export default IssueAdResult;
