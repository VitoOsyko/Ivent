<?
$allOrChecked = $_POST['all_or_checked'];
$brieflyOrDetail = $_POST['briefly_or_detail'];
$photo = $_POST['photo'];
if (isset($photo)) {
  $answer = [
    'success' => true,
    'href' => '../files/speaker.zip'
  ];
} else {
  $answer = [
    'success' => true,
    'href' => '../files/' . $allOrChecked . '_' . $brieflyOrDetail . '.pdf'
  ];
}

sleep(2);
echo json_encode($answer);
?>